export class ControlBuilder {
    constructor(config) {
        this.config = config
    }

    buildControls() {
        const container = d3.select(idSelector(this.config.containerId))
        const controls = container.append("div").attr("class", "control-container")
        this.addCheckbox(
            controls,
            this.config.gitLogScaledId,
            "Insertions / Deletions (scaled by git log)"
        )
        this.addCheckbox(
            controls,
            this.config.actualValuesId,
            "Insertions / Deletions (actual)"
        )
        this.addCheckbox(
            controls,
            this.config.absoluteId,
            "Total changes"
        )
        this.addCheckbox(
            controls,
            this.config.numFilesId,
            "Number of files edited"
        )
        this.addCheckbox(
            controls,
            this.config.commitTypeId,
            "Commit type (as per message)"
        )
        this.addCheckbox(
            controls,
            this.config.scaleByTimeId,
            "X-axis: Date/Time"
        )
        // d3.select(idSelector(this.config.scaleByTimeId)).property("checked", true)
    }

    addCheckbox(containerSelection, id, text) {
        const localContainer = containerSelection.append("div")
        localContainer.append("input")
            .attr("type", "checkbox")
            .attr("class", "control")
            .attr("id", id)
        localContainer.append("label")
            .attr("for", id)
            .text(text)
    }
}


export class ChartBuilder {
    constructor(config) {
        this.config = config
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

        // Chart plottable range
        const xRange = [margin.left, width - margin.right]
        const yRange = [height - margin.bottom, margin.top]

        // Chart bounds
        this.svg = d3.select(idSelector(this.config.containerId))
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        // SCALES
        const scale = {
            "x": {
                "time": d3.scaleUtc()
                    .domain(d3.extent(sortedData, accessor.date))
                    .range(xRange),
                "index": d3.scaleLinear()
                    .domain([0, sortedData.length])
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

        // Checkbox selections
        const yInsertDelete = d3.select(idSelector(this.config.actualValuesId))
        const yGitLogInsertDelete = d3.select(idSelector(this.config.gitLogScaledId))
        const yTotalChanges = d3.select(idSelector(this.config.absoluteId))
        const yNumFiles = d3.select(idSelector(this.config.numFilesId))
        const colCommitType = d3.select(idSelector(this.config.commitTypeId))
        const xByTime = d3.select(idSelector(this.config.scaleByTimeId))
        // Checkbox accessors
        const yIsInsertDelete = () => yInsertDelete.property("checked")
        const yIsGitLog = () => yGitLogInsertDelete.property("checked")
        const yIsChanges = () => yTotalChanges.property("checked")
        const yIsNumFiles = () => yNumFiles.property("checked")
        const colIsByType= () => colCommitType.property("checked")
        const xIsByTime = () => xByTime.property("checked")

        // Dynamic accessors
        const dynXAxisScale = () => {
            if (xIsByTime()) {
                return scale.x.time
            } else {
                return scale.x.index
            }
        }
        const dynXScale = (d, i) => {
            if (xIsByTime()) {
                return scale.x.time(accessor.date(d))
            } else {
                return scale.x.index(i)
            }
        }
        
        // DRAWN ELEMENTS
        this.xAxis = this.svg.append("g")
            .attr("transform", translate(0, (height - margin.bottom)))
            .call(d3.axisBottom(dynXAxisScale()))
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
            .attr("transform", (d, i) => translate(dynXScale(d, i), scale.y.plus(accessor.numPlus(d))))
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


function idSelector(selectString) {
    return `#${selectString}`
}