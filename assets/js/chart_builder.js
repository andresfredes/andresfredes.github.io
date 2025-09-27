export class ChartBuilder {
    constructor(config) {
        this.config = config
        this.colours = {
        }
    }

    buildControls() {
        const container = d3.select(idSelector(this.config.containerId))
        const controls = container.append("div").attr("class", "control-container")
        this.addCheckbox(
            controls,
            this.config.gitLogScaledId,
            "Insertions / Deletions (scaled by git log)",
            true
        )
        this.addCheckbox(
            controls,
            this.config.actualValuesId,
            "Insertions / Deletions (actual)",
            false
        )
        this.addCheckbox(
            controls,
            this.config.absoluteId,
            "Total changes",
            false
        )
        this.addCheckbox(
            controls,
            this.config.numFilesId,
            "Number of files edited",
            false
        )
        this.addCheckbox(
            controls,
            this.config.commitTypeId,
            "Commit type (as per message)",
            false
        )
        this.addCheckbox(
            controls,
            this.config.scaleByTimeId,
            "X-axis: Date/Time",
            true
        )
    }

    addCheckbox(containerSelection, id, text, defaultChecked) {
        const localContainer = containerSelection.append("div")
        localContainer.append("input")
            .attr("type", "checkbox")
            .attr("class", "control")
            .attr("id", id)
            .property("checked", defaultChecked)
        localContainer.append("label")
            .attr("for", id)
            .text(text)
    }

    buildChart(data) {

        // DRAW AREA
        this.size = {
            "width": 1000,
            "height": 500,
            "margin": {
                "top": 50,
                "bottom": 70,
                "left": 100,
                "right": 50
            }
        }

        // Chart plottable range
        const xRange = [this.size.margin.left, this.size.width - this.size.margin.right]
        const yRange = [this.size.height - this.size.margin.bottom, this.size.margin.top]

        // Chart bounds
        this.svg = d3.select(idSelector(this.config.containerId))
            .append("svg")
            .attr("viewBox", `0 0 ${this.size.width} ${this.size.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        // DATA CALCULATION AND ACCESS
        // Accessor functions for data
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

        // DATA
        this.data = d3.sort(data, accessor.date)

        // Scales
        const scale = {
            "x": {
                "time": d3.scaleUtc()
                    .domain(d3.extent(this.data, accessor.date))
                    .range(xRange),
                "index": d3.scaleLinear()
                    .domain([1, this.data.length + 1])
                    .range(xRange)
            },
            "y": {
                "changes": d3.scaleLinear() 
                    .domain(d3.extent(this.data, accessor.changes))
                    .range(yRange),
                "plus": d3.scaleLinear()
                    .domain([-d3.max(this.data, accessor.numMinus), d3.max(this.data, accessor.numPlus)])
                    .range(yRange),
                "minus": d3.scaleLinear()
                    .domain([-d3.max(this.data, accessor.numMinus), d3.max(this.data, accessor.numPlus)])
                    .range(yRange),
                "files": d3.scaleLinear()
                    .domain(d3.extent(this.data, accessor.numFiles))
                    .range(yRange),
                "insertions": d3.scaleLinear()
                    .domain([-d3.max(this.data, accessor.deletions), d3.max(this.data, accessor.insertions)])
                    .range(yRange),
                "deletions": d3.scaleLinear()
                    .domain([-d3.max(this.data, accessor.deletions), d3.max(this.data, accessor.insertions)])
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
    
        const filterData = () => {
            const filtered = {
                "gitScaled": [],
                "actual": [],
                "total": [],
                "files": []
            }
            
            let xScale = scale.x.index
            let xAccessor = (d, i) => i
            if (xByTime.property("checked")) {
                xScale = scale.x.time
                xAccessor = (d, i) => d
            }
            let i = 1
            let x = 0
            let hash = ""
            for (const d of this.data) {
                //  TODO: colour
                x = xScale(xAccessor(accessor.date(d), i))
                hash = accessor.hash(d)
                if (yGitLogInsertDelete.property("checked")) {
                    filtered.gitScaled.push({
                        "hash": hash,
                        "insert": scale.y.plus(accessor.numPlus(d)),
                        "delete": scale.y.minus(-accessor.numMinus(d)),
                        "mid": scale.y.plus(0),
                        "x": x,
                        "colours": {}
                    })
                }
                if (yInsertDelete.property("checked")) {
                    filtered.actual.push({
                        "hash": hash,
                        "insert": scale.y.insertions(accessor.insertions(d)),
                        "delete": scale.y.deletions(-accessor.deletions(d)),
                        "mid": scaled.y.insertions(0),
                        "x": x,
                        "colours": {}
                    })
                }
                if (yTotalChanges.property("checked")) {
                    filtered.total.push({
                        "hash": hash,
                        "changes": scale.y.changes(accessor.changes(d)),
                        "x": x,
                        "colour": ""
                    })
                }
                if (yNumFiles.property("checked")) {
                    filtered.total.push({
                        "hash": hash,
                        "num": scale.y.files(accessor.files(d)),
                        "x": x,
                        "colour": ""
                    })
                }
                i++
            }
            return filtered
        }
        d3.selectAll(".control").on("change", () => {
            this.updateChart(filterData())
        })
        this.updateChart(filterData())
    }

    updateChart(updateData) {
        // Required for all charts
        console.log(updateData)
        const t = this.svg.transition().duration(750)

        // Git-scaled values
        this.svg.selectAll(".plus")
            .data(updateData.gitScaled)
            .join(
                enter => {
                    enter.append("path")
                        .attr("class", "plus")
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .attr("fill", "none")
                        .attr("stroke", "green")
                        .attr("stroke-width", 1)
                        .transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.insert}`)

                },
                update => {
                    update.transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.insert}`)
                },
                exit => {
                    exit.transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .remove()
                }
            )
        this.svg.selectAll(".minus")
            .data(updateData.gitScaled)
            .join(
                enter => {
                    enter.append("path")
                        .attr("class", "minus")
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .attr("fill", "none")
                        .attr("stroke", "red")
                        .attr("stroke-width", 1)
                        .transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.delete}`)

                },
                update => {
                    update.transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.delete}`)
                },
                exit => {
                    exit.transition(t)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .remove()
                }
            )

        // Actual values

        // Total changes
        

        // Number of files changed
    }
}

// Translate string is prone to my typo-errors. This is a little safer.
function translate(x, y) {
    return `translate(${x},${y})`
}


function idSelector(selectString) {
    return `#${selectString}`
}