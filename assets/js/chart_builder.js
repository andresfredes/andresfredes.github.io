export class ChartBuilder {
    constructor(config) {
        this.containerId = config.containerId
    }

    buildChart(data) {
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
        const xRange = [margin.left, width - margin.right]
        const yRange = [height - margin.bottom, margin.top]

        // Helper functions for accessing datum specifics
        const accessor = {
            "hash": (d) => d.detail.hash,
            "date": (d) => d.detail.date,
            "message": (d) => d.detail.message,
            "files": (d) => d.fileInfo.files,
            "changes": (d) => d.fileInfo.files,
            "numPlus": (d) => d.fileInfo.numPlus,
            "numMinus": (d) => d.fileInfo.numMinus,
            "numFiles": (d) => d.total.numFiles,
            "insertions": (d) => d.total.insertions,
            "deletions": (d) => d.total.deletions
        }
        const sortedData = d3.sort(data, accessor.date)

        // Scales
        const scale = {
            "x": {
                "time": d3.scaleUtc()
                    .domain(d3.extent(sortedData, accessor.date))
                    .range(...xRange)
            },
            "y": {
                "changes": d3.scaleLinear() 
                    .domain(d3.extent(sortedData, accessor.changes))
                    .range(...yRange)
            }
        }

        // SVG draw area
        this.svg = d3.select(this.containerId)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        // Axes
        this.xAxis = this.svg.append("g")
            .attr("transform", translate(0, (height - margin.bottom)))
            .call(d3.axisBottom(scale.x.time))
        this.yAxis = this.svg.append("g")
            .attr("transform", translate(margin.left, 0))
            .call(d3.axisLeft(scale.y.changes))
    }
}

// Translate string is prone to my typo-errors. This is a little safer.
function translate(x, y) {
    return `translate(${x},${y})`
}