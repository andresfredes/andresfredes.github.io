(function() {
    const url = "/assets/commits.txt"
    const req = new Request(url)

    window
        .fetch(req)
        .then((res) => res.text())
        .then((text) => {
            const commits = getCommits(text)
            console.log(commits)
        })
})()


function getCommits(text) {
    const commits = []
    let currentCommit = {}
    let lineSegments = []
    const lines = text.split("\n")
    while (lines.length > 0) {
        let currentLine = lines.pop()
        if (currentLine === '') {
            continue
        }
        lineSegments = currentLine.split("|")
        switch (lineSegments.length) {
            // insertion and deletion totals
            case 1:
                currentCommit["total"] = getTotals(lineSegments[0])
                break
            // file changes
            case 2:
                if (!("fileInfo" in currentCommit)) {
                    currentCommit["fileInfo"] = {
                        "files": [],
                        "changes": 0,
                        "numPlus": 0,
                        "numMinus": 0
                    }
                }
                currentCommit.fileInfo = addFileDetails(currentCommit.fileInfo, lineSegments[0], lineSegments[1])
                break
            // commit details
            case 3:
                currentCommit["detail"] = getCommitDetails(
                    lineSegments[0],
                    lineSegments[1],
                    lineSegments[2]
                )
                commits.push(currentCommit)
                currentCommit = {}
                break
            default:
                console.log("Oh oh!")
        }
    }
    return commits
}


function getCommitDetails(hash, date, message) {
    return {
        "hash": hash,
        "date": Date(date),
        "message": message
    }
}


function addFileDetails(current, filename, changes) {
    current.files.push(filename.trim())
    if (!(changes.includes("Bin"))) {
        const changeParts = changes.trim().split(" ")
        const numChanges = Number(changeParts[0])
        current.changes += numChanges
        if (numChanges !== 0) {
            for (const char of changeParts[1]) {
                if (char === "+") {
                    current.numPlus++
                }
                if (char === "-") {
                    current.numMinus++
                }
            }
        }
    }
    return current
}


function getTotals(totalsLine) {
    const totals = {
        "numFiles": 0,
        "insertions": 0,
        "deletions": 0
    }
    const parts = totalsLine.split(",")
    for (const part of parts) {
        const subParts = part.split(" ")
        const value = Number(subParts[1])
        if (part.includes("file")) {
            totals.numFiles += value
        } else if (part.includes("insert")) {
            totals.insertions += value
        } else {
            totals.deletions += value
        }
    }
    return totals
}

//     hash: str
//     date: datetime
//     message: str

//     files: []
//     changes: int
//     plus: int
//     minus: int

//     num_files: int
//     insertions: int
//     deletions: int