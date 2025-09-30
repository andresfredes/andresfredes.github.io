export class ChartBuilder {
    constructor(config) {
        this.config = config
    }

    saveText(text) {
        this.text = text
    }

    buildControlsA() {
        const container = d3.select(idSelector(this.config.containerId))
        const controls = container.append("div").attr("class", "control-container")
        this.addCheckbox(
            controls,
            this.config.gitLogScaledId,
            "Insertions / Deletions (scaled by git)",
            true
        )
        this.addCheckbox(
            controls,
            this.config.actualValuesId,
            "Insertions / Deletions (actual, on log scale)",
            false
        )
    }

    buildControlsB() {
        const container = d3.select(idSelector(this.config.containerId))
        const controls = container.append("div").attr("class", "control-container")
        controls.append("div")
            .append("label")
            .text("----")
        this.addCheckbox(
            controls,
            this.config.scaleByTimeId,
            "X-axis: Date/Time",
            false
        )
        controls.append("div")
            .append("label")
            .text("----")
        this.addCheckbox(
            controls,
            this.config.absoluteId,
            "Total changes (insertions and deletions, on log scale)",
            false
        )
        this.addCheckbox(
            controls,
            this.config.numFilesId,
            "Number of files edited",
            true
        )
    }

    buildControlsC() {
        const container = d3.select(idSelector(this.config.containerId))
        const controls = container.append("div").attr("class", "control-container")
        controls.append("div")
            .append("label")
            .text("----")
        controls.append("div")
            .append("label")
            .text("Commits that share file(s) edited")
    }

    buildChartFooter() {
        const container = d3.select(idSelector(this.config.containerId))
        const control = container.append("div")
        control.append("input")
            .attr("type", "checkbox")
            .attr("id", this.config.showRawId)
        control.append("label")
            .attr("for", this.config.showRawId)
            .text("Show raw data")
        control.append("div").attr("class", "toggle-content")
            .append("p")
            .text(this.text)
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

        // Chart bounds and control elements
        this.buildControlsA()
        this.svgA = d3.select(idSelector(this.config.containerId))
            .append("svg")
            .attr("viewBox", `0 0 ${this.size.width} ${this.size.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")

        this.buildControlsB()
        this.svgB = d3.select(idSelector(this.config.containerId))
            .append("svg")
            .attr("viewBox", `0 0 ${this.size.width} ${this.size.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        this.buildControlsC()
        this.svgC = d3.select(idSelector(this.config.containerId))
            .append("svg")
            .attr("viewBox", `0 0 ${this.size.width} ${this.size.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("id", "chart-svg")
        
        this.buildChartFooter()
        
        // DATA CALCULATION AND ACCESS
        const safeLog = (d) => {
            const sign = Math.sign(d)
            return sign * Math.log1p(Math.abs(d))
        }
        const typeOrder = {
            "code:": 1,
            "post:": 2,
            "plan": 3,
            "doc": 4,
            "bug": 5,
            
        }
        const typeFromMessage = (message) => {
            for (const [key, value] of Object.entries(typeOrder)) {
                if (message.startsWith(key)) {
                    return value
                }
            }
            return 0
        }

        // Accessor functions for data
        const accessor = {
            "hash": (d) => d.detail.hash,
            "date": (d) => d.detail.date,
            "message": (d) => d.detail.message,
            "files": (d) => d.fileInfo.files,
            "changes": (d) => d.fileInfo.changes,
            "logChanges": (d) => safeLog(d.fileInfo.changes),
            "numPlus": (d) => d.fileInfo.numPlus,
            "numMinus": (d) => d.fileInfo.numMinus,
            "numFiles": (d) => d.total.numFiles,
            "insertions": (d) => d.total.insertions,
            "deletions": (d) => d.total.deletions,
            "logInsertions": (d) => safeLog(d.total.insertions),
            "logDeletions": (d) => safeLog(d.total.deletions),
            "typeOrdinal": (d) => typeFromMessage(d.detail.message)
        }

        // DATA
        this.data = d3.sort(data, accessor.date)

        // Scales
        const maxValue = (accessorA, accessorB) => {
            const a = d3.max(this.data, accessorA)
            const b = d3.max(this.data, accessorB)
            return a > b ? a : b
        }
        const gitScaledMax = maxValue(accessor.numMinus, accessor.numPlus)
        const gitScaledDomain = [-gitScaledMax, gitScaledMax]
        const actualValuesMax = maxValue(accessor.logInsertions, accessor.logDeletions)
        const actualValuesDomain = [-actualValuesMax, actualValuesMax]
        
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
                    .domain(d3.extent(this.data, accessor.logChanges))
                    .range(yRange),
                "plus": d3.scaleLinear()
                    .domain(gitScaledDomain)
                    .range(yRange),
                "minus": d3.scaleLinear()
                    .domain(gitScaledDomain)
                    .range(yRange),
                "files": d3.scaleLinear()
                    .domain(d3.extent(this.data, accessor.numFiles))
                    .range(yRange),
                "insertions": d3.scaleLinear()
                    .domain(actualValuesDomain)
                    .range(yRange),
                "deletions": d3.scaleLinear()
                    .domain(actualValuesDomain)
                    .range(yRange)
            },
            "symbol": {
                "type": d3.scaleOrdinal(d3.symbolsStroke)
            },
            "colour": {
                "type": d3.scaleOrdinal(d3.schemeDark2)
            }
        }

        // Checkbox selections
        const yInsertDelete = d3.select(idSelector(this.config.actualValuesId))
        const yGitLogInsertDelete = d3.select(idSelector(this.config.gitLogScaledId))
        const yTotalChanges = d3.select(idSelector(this.config.absoluteId))
        const yNumFiles = d3.select(idSelector(this.config.numFilesId))
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
                x = xScale(xAccessor(accessor.date(d), i))
                hash = accessor.hash(d)
                if (yGitLogInsertDelete.property("checked")) {
                    filtered.gitScaled.push({
                        "hash": hash,
                        "insert": scale.y.plus(accessor.numPlus(d)),
                        "delete": scale.y.minus(-accessor.numMinus(d)),
                        "mid": scale.y.plus(0),
                        "x": x,
                        "colour": {"insert": "green", "delete": "red"}
                    })
                }
                if (yInsertDelete.property("checked")) {
                    filtered.actual.push({
                        "hash": hash,
                        "insert": scale.y.insertions(accessor.logInsertions(d)),
                        "delete": scale.y.deletions(-accessor.logDeletions(d)),
                        "mid": scale.y.insertions(0),
                        "x": x,
                        "colour": {"insert": "green", "delete": "red"}
                    })
                }
                if (yTotalChanges.property("checked")) {
                    filtered.total.push({
                        "hash": hash,
                        "changes": scale.y.changes(accessor.logChanges(d)),
                        "x": x,
                        "colour": "white",
                        "symbol": d3.symbol(scale.symbol.type(accessor.typeOrdinal(d)))()
                    })
                }
                if (yNumFiles.property("checked")) {
                    filtered.files.push({
                        "hash": hash,
                        "num": scale.y.files(accessor.numFiles(d)),
                        "x": x,
                        "colour": "blue"
                    })
                }
                i++
            }
            return filtered
        }

        const commitData = () => {
            const commits = []
            for (const d of this.data) {
                const links = []
                const comparisonFiles = accessor.files(d)
                this.data.forEach(commit => {
                    if (accessor.hash(commit) !== accessor.hash(d)) {
                        for (const file of accessor.files(commit)) {
                            if (comparisonFiles.includes(file)) {
                                links.push(accessor.hash(commit))
                                break
                            }
                        }
                    }
                })
                commits.push({
                    "hash": accessor.hash(d),
                    "changes": scale.y.changes(accessor.logChanges(d)),
                    "colour": scale.colour.type(accessor.typeOrdinal(d)),
                    "sharesFiles": links
                })
            }
            return commits
        }

        d3.selectAll(".control").on("change", () => {
            this.updateChart(filterData())
        })
        this.updateChart(filterData())
        this.buildForceChart(commitData())
    }

    insertDeleteLines(svg, transition, data, cssClass, key, width, opacity) {
        svg.selectAll(`.${cssClass}`)
            .data(data)
            .join(
                enter => {
                    enter.append("path")
                        .attr("class", cssClass)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .attr("fill", "none")
                        .attr("opacity", opacity)
                        .attr("stroke", (d) => d.colour[key])
                        .attr("stroke-width", width)
                        .transition(transition)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d[key]}`)

                },
                update => {
                    update.transition(transition)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d[key]}`)
                },
                exit => {
                    exit.transition(transition)
                        .attr("d", (d) => `M${d.x},${d.mid}L${d.x},${d.mid}`)
                        .remove()
                }
            )
    }

    updateChart(updateData) {
        
        // Overarching transitions
        const tA = this.svgA.transition().duration(750)
        const tB = this.svgB.transition().duration(750)

        // CHART A
        // Git-scaled values
        this.insertDeleteLines(this.svgA, tA, updateData.gitScaled, "plus", "insert", 1, 0.6)
        this.insertDeleteLines(this.svgA, tA, updateData.gitScaled, "minus", "delete", 1, 0.6)

        // Actual values
        this.insertDeleteLines(this.svgA, tA, updateData.actual, "insertions", "insert", 2, 0.4)
        this.insertDeleteLines(this.svgA, tA, updateData.actual, "deletions", "delete", 2, 0.4)

        // CHART B
        // Total changes
        this.svgB.selectAll(`.${"changes"}`)
            .data(updateData.total)
            .join(
                enter => {
                    enter.append("path")
                        .attr("class", "changes")
                        .attr("fill", "none")
                        .attr("opacity", 1)
                        .attr("stroke", (d) => d.colour)
                        .attr("stroke-width", 1)
                        .attr("transform", (d) => translate(d.x, this.size.height))
                        .transition(tB)
                        .attr("d", (d) => d.symbol)
                        .attr("transform", (d) => translate(d.x, d.changes))
                },
                update => {
                    update.transition(tB)
                        .attr("d", (d) => d.symbol)
                        .attr("transform", (d) => translate(d.x, d.changes))
                },
                exit => {
                    exit.transition(tB)
                        .attr("transform", (d) => translate(d.x, this.size.height))
                        .remove()
                }
            )

        // Number of files changed
        this.svgB.selectAll(`.${"files"}`)
            .data(updateData.files)
            .join(
                enter => {
                    enter.append("path")
                        .attr("class", "files")
                        .attr("d", (d) => `M${d.x},${this.size.height}L${d.x},${this.size.height}`)
                        .attr("fill", "none")
                        .attr("opacity", 0.5)
                        .attr("stroke", (d) => d.colour)
                        .attr("stroke-width", 3)
                        .transition(tB)
                        .attr("d", (d) => `M${d.x},${this.size.height}L${d.x},${d.num}`)

                },
                update => {
                    update.transition(tB)
                        .attr("d", (d) => `M${d.x},${this.size.height}L${d.x},${d.num}`)
                },
                exit => {
                    exit.transition(tB)
                        .attr("d", (d) => `M${d.x},${this.size.height}L${d.x},${this.size.height}`)
                        .remove()
                }
            )
    }

    buildForceChart(updateData) {

        const nodes = updateData.map((d) => ({ ...d }))
        const links = updateData.flatMap((d) => {
            return d.sharesFiles.map((target) => ({ "source": d.hash, target }))
        })

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.hash).strength(0.1))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("x", d3.forceX(this.size.width / 2))
            .force("y", d3.forceY(this.size.height / 2))

        const link = this.svgC.append("g")
            .attr("stroke", "white")
            .attr("stroke-opacity", 0.2)
            .attr("stroke-width", 1)
            .selectAll()
            .data(links)
            .join("line")
        
        const node = this.svgC.append("g")
            .attr("stroke", "none")
            .selectAll()
            .data(nodes)
            .join("circle")
            .attr("r", 8)
            .attr("fill", (d) => d.colour)
            .call(drag(simulation))
        
        simulation.on("tick", () => {
                link.attr("x1", (d) => d.source.x)
                    .attr("y1", (d) => d.source.y)
                    .attr("x2", (d) => d.target.x)
                    .attr("y2", (d) => d.target.y)
                node.attr("transform", (d) => translate(d.x, d.y))
                if (simulation.alpha() < 0.01) {
                    simulation.stop()
                }
        })

        function drag(simulation) {
            return d3.drag()
                .on("start", (e, d) => {
                    if (!e.active) {
                        simulation.alphaTarget(0.3).restart()
                    }
                    d.fx = d.x
                    d.fy = d.y
                })
                .on("drag", (e, d) => {
                    d.fx = e.x
                    d.fy = e.y
                })
                .on("end", (e, d) => {
                    if (!e.active) {
                        simulation.alphaTarget(0)
                        d.fx = null
                        d.fy = null
                    }
                })
        }
    }
}

// Translate string is prone to my typo-errors. This is a little safer.
function translate(x, y) {
    return `translate(${x},${y})`
}


function idSelector(selectString) {
    return `#${selectString}`
}