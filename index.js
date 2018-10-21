const colors = ['#011c41', '#3bbadd', '#c4dad3', '#f2e8c3', '#f5a219', '#da2a04']
const colorPicker = (temp) => {
    return (
        temp >= 11 ? colors[5] :
            temp >= 9.5 ? colors[4] :
                temp >= 8 ? colors[3] :
                    temp >= 6.5 ? colors[2] :
                        temp >= 5 ? colors[1] : colors[0]
    )
}
 
const createGraph = (dataset) => {
    const barWidth = 5
    const width = barWidth * Math.ceil(dataset.monthlyVariance.length/12)
    const barHeight = 30
    const height = barHeight * 12
    const margin = 60
    const yearFormat = d3.format('d')
    const monthFormat = d3.timeFormat('%B')
    const xScale = d3.scaleLinear().domain([d3.min(dataset.monthlyVariance, (d) => d.year), d3.max(dataset.monthlyVariance, (d) => d.year)]).range([0, width])
    const yScale = d3.scaleTime().domain(d3.extent(dataset.monthlyVariance, (d) => new Date(Date.UTC(1970, d.month - 1)))).range([0, height])
    const xAxis = d3.axisBottom(xScale).tickFormat(yearFormat)
    const yAxis = d3.axisLeft(yScale).tickFormat(monthFormat).ticks(d3.utcMonth.every(1))
    const baseTemp = dataset.baseTemperature

    const tooltip = d3.select('#heatmap')
                .append('div')
                .attr('id', 'tooltip')
                .style('opacity', 0)
    
    const svg = d3.select('#heatmap')
                .append('svg')
                .attr('width', width + 2 * margin)
                .attr('height', height + 2 * margin)

            svg.selectAll('rect')
                .data(dataset.monthlyVariance)
                .enter()
                .append('rect')
                .attr('x', (d) => margin + xScale(d.year))
                .attr('width', barWidth)
                .attr('y', (d) => margin - 0.5 * barHeight + yScale(new Date(Date.UTC(1970, d.month - 1))))
                .attr('height', barHeight)
                .attr('class', 'cell')
                .attr('data-month', (d) => d.month - 1)
                .attr('data-year', (d) => d.year)
                .attr('data-temp', (d) => d.variance + baseTemp)
                .style('fill', (d) => colorPicker(baseTemp + d.variance))
                .on('mouseover', (d) => {
                    tooltip.style('opacity', 0.8)
                        .attr('data-year', d.year)
                        .style('left', (d3.event.pageX + 15) + 'px')
                        .style('top', (d3.event.pageY - 30) + 'px')
                        .html(`Year: ${d.year}<br/>Month: ${d.month}<br/>Temperature: ${d.variance + baseTemp}`)
                })
                .on('mouseout', (d) => {
                    tooltip.style('opacity', 0)
                })

            svg.append('g')
                .attr('id', 'x-axis')
                .attr('transform', `translate(${margin}, ${height + margin + 0.5 * barHeight})`)
                .call(xAxis)
            svg.append('g')
                .attr('id', 'y-axis')
                .attr('transform', `translate(${margin}, ${margin})`)
                .call(yAxis)

    const legendRectW = 50
    const legendRectH = 35
    const legendXScale = d3.scaleLinear().domain([3.5, 12.5]).range([0, (6 * legendRectW)])
    const legendXAxis = d3.axisBottom(legendXScale).tickArguments([5]).tickValues([5, 6.5, 8, 9.5, 11]).tickFormat(d3.format('~f'))

    const legend = d3.select('#legend')
                .append('svg')
                .attr('width', 6 * legendRectW)
                .attr('height', 2 * legendRectH)
            legend.selectAll('rect')
                .data(colors)
                .enter()
                .append('rect')
                .attr('x', (d, i) => i * legendRectW)
                .attr('width', legendRectW)
                .attr('y', 0)
                .attr('height', legendRectH)
                .style('fill', (d) => d)
            legend.append('g')
                .attr('transform', `translate(0, ${legendRectH})`)
                .call(legendXAxis)
        

}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then((res) => res.json())
    .then((data) => {
        createGraph(data)
    })