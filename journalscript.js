function saveData() {
    const table = document.getElementById("inputTable").querySelector("tbody");
    const rows = table.querySelectorAll("tr");

    const journalEntries = [];
    for (let i = 0; i < rows.length; i += 3) {
        const mainRow = rows[i];
        const subRow = rows[i + 1];
        const descRow = rows[i + 2];

        const inputs = {
            main: mainRow.querySelectorAll("input"),
            sub: subRow.querySelectorAll("input"),
            desc: descRow.querySelectorAll("input")
        };

        const entry = {
            date: "",
            mainAccount: "",
            subAccount: "",
            pr: "",
            subPr: "",
            debit: "",
            credit: "",
            description: ""
        };

        // Capture main row inputs
        inputs.main.forEach((input) => {
            if (input.name === "date[]") entry.date = input.value || "";
            if (input.name === "main_account_title[]") entry.mainAccount = input.value || "";
            if (input.name === "main_post_ref[]") entry.pr = input.value || "";
            if (input.name === "debit[]") entry.debit = parseFloat(input.value) || 0;
        });

        // Capture sub row inputs
        inputs.sub.forEach((input) => {
            if (input.name === "sub_account_title[]") entry.subAccount = input.value || "";
            if (input.name === "sub_post_ref[]") entry.subPr = input.value || "";
            if (input.name === "credit[]") entry.credit = parseFloat(input.value) || 0;
        });

        // Capture description
        inputs.desc.forEach((input) => {
            if (input.name === "description[]") entry.description = input.value || "";
        });

        journalEntries.push(entry);
    }

    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
    updateLedger();
}

function loadData() {
    const storedEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    if (!storedEntries.length) return;

    const table = document.getElementById("inputTable").querySelector("tbody");
    table.innerHTML = "";

    storedEntries.forEach((entry) => {
        addRow(entry);
    });
}

function addRow(entry = {}) {
    const table = document.getElementById("inputTable").querySelector("tbody");

    const mainRow = table.insertRow();
    mainRow.innerHTML = `
        <td><input type="date" name="date[]" value="${entry.date || ""}" onchange="saveData()" required></td>
        <td><input type="text" name="main_account_title[]" value="${entry.mainAccount || ""}" placeholder="Main Account Title" onchange="saveData()" required></td>
        <td><input type="text" name="main_post_ref[]" value="${entry.pr || ""}" placeholder="PR (ex. 110)" onchange="saveData()" required></td>
        <td><input type="number" name="debit[]" value="${entry.debit || ""}" min="0" step="0.01" onchange="saveData()" required></td>
        <td></td>
        <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Remove</button></td>
    `;

    const subRow = table.insertRow();
    subRow.innerHTML = `
        <td></td>
        <td><input type="text" name="sub_account_title[]" value="${entry.subAccount || ""}" placeholder="Sub Account Title" class="tabbed" onchange="saveData()" required></td>
        <td><input type="text" name="sub_post_ref[]" value="${entry.subPr || ""}" placeholder="PR (ex. 310)" onchange="saveData()" required></td>
        <td></td>
        <td><input type="number" name="credit[]" value="${entry.credit || ""}" min="0" step="0.01" onchange="saveData()" required></td>
        <td></td>
    `;

    const descRow = table.insertRow();
    descRow.innerHTML = `
        <td></td>
        <td><input type="text" name="description[]" value="${entry.description || ""}" placeholder="Description of tasks" onchange="saveData()" required></td>
        <td colspan="3"></td>
        <td></td>
    `;
}

function deleteRow(button) {
    const row = button.closest("tr");
    const subRow = row.nextElementSibling;
    const descRow = subRow.nextElementSibling;

    row.remove();
    subRow.remove();
    descRow.remove();
    saveData();
}

function updateLedger() {
    const ledgerContainer = document.getElementById("ledgerGroups");
    const storedEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");

    ledgerContainer.innerHTML = "";

    const groupedEntries = storedEntries.reduce((groups, entry) => {
        if (entry.pr) {
            if (!groups[entry.pr]) groups[entry.pr] = [];
            groups[entry.pr].push({
                ...entry,
                accountType: "Main Account",
                accountTitle: entry.mainAccount, // Set account title to main account
                debit: entry.debit,
                credit: 0 // Automatically set credit to 0 for main account
            });
        }
        if (entry.subPr && entry.subPr !== entry.pr) {
            if (!groups[entry.subPr]) groups[entry.subPr] = [];
            groups[entry.subPr].push({
                ...entry,
                accountType: "Sub Account",
                accountTitle: entry.subAccount, // Set account title to sub account
                debit: 0, // Automatically set debit to 0 for sub account
                credit: entry.credit
            });
        }
        return groups;
    }, {});

    Object.entries(groupedEntries).forEach(([prKey, entries]) => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("group");

        let groupTotal = 0;

        groupDiv.innerHTML = `
            <div class="group-header">
                Posting Reference: ${prKey}
            </div>
            <table class="ledger-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Account</th>
                        <th>DR</th>
                        <th>CR</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map((entry) => {
                        let entryTotal = entry.debit || entry.credit;
                        if (prKey == "1" || "5"){
                            if (entryTotal = entry.debit){
                                groupTotal += entryTotal
                            } if (entryTotal = entry.credit){
                                groupTotal -= entryTotal
                            }
                        } else {
                            if (entryTotal = entry.credit){
                                groupTotal += entryTotal
                            } if (entryTotal = entry.debit){
                                groupTotal -= entryTotal
                            }
                        }

                        return `
                            <tr>
                                <td>${entry.date}</td>
                                <td>${entry.accountTitle} (${entry.accountType})</td>
                                <td>${entry.debit || 0}</td>
                                <td>${entry.credit || 0}</td>
                                <td>${entryTotal}</td>
                            </tr>
                        `;
                    }).join("")}
                    <tr class="group-total">
                        <td colspan="4">Group Total</td>
                        <td>${groupTotal}</td>
                    </tr>
                </tbody>
            </table>
        `;
        ledgerContainer.appendChild(groupDiv);
    });
}

function deleteall() {
    // Clear all journal entries from local storage 
    localStorage.removeItem("journalEntries"); 
    // Clear the table in the journal form 
    document.getElementById("inputTable").querySelector("tbody").innerHTML = ""; 
    // Update the ledger to reflect changes 
    updateLedger();
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    updateLedger();
});
