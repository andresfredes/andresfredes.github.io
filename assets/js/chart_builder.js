export class ChartBuilder {
    constructor(config) {
        this.containerId = config.containerId
    }

    buildChart(data) {

        // DATA
        // Accessor functions for use with d3 pattern
        const accessor = {
            "hash": (d) => d.detail.hash,
            "date": (d) => d.detail.date,
            "message": (d) => d.detail.message,
            "files": (d) => d.fileInfo.files,
            "changes": (d) => d.fileInfo.changes,
            "numPlus": (d) => d.fileInfo.numPlus,
            "numMinus": (d) => d.fileInfo.numMinus,
            "numFiles": (d) => d.total.numFiles,
            "insertions": (d) => d.total.insertions,
            "deletions": (d) => d.total.deletions
        }

        const sortedData = d3.sort(data, accessor.date)

        // DRAW AREA
        // Internal draw coodinate bounds (2:1 ratio chart)
        const width = 1000
        const height = 500

        // Margin between chart bounds and draw area bounds
        const margin = {
            "top": 50,
            "bottom": 70,
            "left": 100,
            "right": 50
        }

        // Chart bounds
        const xRange = [margin.left, width - margin.right]
        const yRange = [height - margin.bottom, margin.top]

        this.svg = d3.select(this.containerId)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        // SCALES
        const scale = {
            "x": {
                "time": d3.scaleUtc()
                    .domain(d3.extent(sortedData, accessor.date))
                    .range(xRange)
            },
            "y": {
                "changes": d3.scaleLinear() 
                    .domain(d3.extent(sortedData, accessor.changes))
                    .range(yRange),
                "plus": d3.scaleLinear()
                    .domain(d3.extent(sortedData, accessor.numPlus))
                    .range(yRange),
                "minus": d3.scaleLinear()
                    .domain(d3.extent(sortedData, accessor.numMinus))
                    .range(yRange)
            }
        }
        
        // DRAWN ELEMENTS
        this.xAxis = this.svg.append("g")
            .attr("transform", translate(0, (height - margin.bottom)))
            .call(d3.axisBottom(scale.x.time))
        this.yAxis = this.svg.append("g")
            .attr("transform", translate(margin.left, 0))
            .call(d3.axisLeft(scale.y.changes))
        
        const dotPlus = this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .selectAll(".plus")
            .data(sortedData)
            .join(
                enter => enter.append("circle").attr("class", "plus"),
                update => update,
                exit => exit.remove()
            )
            .attr("transform", d => translate(scale.x.time(accessor.date(d)), scale.y.plus(accessor.numPlus(d))))
            .attr("r", 3)
        
        const dotMinus = this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .selectAll(".minus")
            .data(sortedData)
            .join(
                enter => enter.append("circle").attr("class", "minus"),
                update => update,
                exit => exit.remove()
            )
            .attr("transform", d => translate(scale.x.time(accessor.date(d)), scale.y.minus(accessor.numMinus(d))))
            .attr("r", 3)
    }
}

// Translate string is prone to my typo-errors. This is a little safer.
function translate(x, y) {
    return `translate(${x},${y})`
}