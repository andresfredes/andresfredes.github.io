import { ChartBuilder } from "./chart_builder.js"



commitChart()


function commitChart() {
    const url = "/assets/commits.txt"
    const req = new Request(url)
    const chartConfig = {
        "containerId": "chart-container",
        "gitLogScaledId": "git-log-selector",
        "actualValuesId": "actual-selector",
        "absoluteId": "absolute-selector",
        "numFilesId": "files-selector",
        "commitTypeId": "commit-type-selector",
        "scaleByTimeId": "scale-time-selector"
    }
    
    const builder = new ChartBuilder(chartConfig)
    builder.buildControls()

    window
        .fetch(req)
        .then((res) => res.text())
        .then((text) => {
            const commits = parseCommits(text)
            builder.buildChart(commits)
        })
}


function parseCommits(text) {
    const commits = []
    let currentCommit = new Commit()
    const lines = text.split("\n")
    while (lines.length > 0) {
        let currentLine = lines.pop()
        if (currentLine === '') {
            continue
        }
        if (currentCommit.addCommitTextLine(currentLine)) {
            commits.push(currentCommit)
            currentCommit = new Commit()
        }
    }
    return commits
}


export class Commit {
    constructor() {
        this.entryComplete = false
        this.detail = {
            "hash": "",
            "date": Date.now(),
            "message": ""
        }
        this.fileInfo = {
            "files": [],
            "changes": 0,
            "numPlus": 0,
            "numMinus": 0
        }
        this.total = {
            "numFiles": 0,
            "insertions": 0,
            "deletions": 0
        }
    }

    addCommitTextLine(line) {
        const lineSegments = line.split("|")
        switch (lineSegments.length) {
            // insertion and deletion totals
            case 1:
                this.addTotal(lineSegments[0])
                break
            // file changes
            case 2:
                this.addFileInfo(lineSegments[0], lineSegments[1])
                break
            // commit info
            case 3:
                this.addDetail(lineSegments[0], lineSegments[1], lineSegments[2])
                this.entryComplete = true
                break
            // not required - debugging only
            default:
                console.log("Should not be here!")
                break
        }
        return this.entryComplete
    }

    addDetail(hash, date, message) {
        this.detail.hash = hash
        this.detail.date = new Date(date)
        this.detail.message = message
    }

    addFileInfo(filename, changes) {
        this.fileInfo.files.push(filename.trim())
        // Ignore Binary file size details - "Bin"
        if (!(changes.includes("Bin"))) {
            const changeSplit = changes.trim().split(" ")
            const numChanges = Number(changeSplit[0])
            this.fileInfo.changes += numChanges
            // Ignore numPlus and numMinus when no changes
            if (numChanges !== 0) {
                for (const char of changeSplit[1]) {
                    switch (char) {
                        case "+":
                            this.fileInfo.numPlus++
                            break
                        case "-":
                            this.fileInfo.numMinus++
                            break
                        // Ignore any other chars if included
                        default:
                            break
                    }
                }
            }
        }
    }

    addTotal(line) {
        for (const text of line.split(",")) {
            const words = text.split(" ")
            const value = Number(words[1])
            if (text.includes("file")) {
                this.total.numFiles += value
            } else if (text.includes("insert")) {
                this.total.insertions += value
            } else {
                this.total.deletions += value
            }
        }
    }
}