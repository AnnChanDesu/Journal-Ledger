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

        // Existing saveData logic
        localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
        updateLedger();
        updateTrialBalance(); // Update trial balance
    }
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

    // Main row
    const mainRow = table.insertRow();
    mainRow.innerHTML = `
        <td><input type="date" name="date[]" value="${entry.date || ""}" onchange="saveData()" required></td>
        <td><input type="text" name="main_account_title[]" value="${entry.mainAccount || ""}" placeholder="Main Account Title" onchange="saveData()" required></td>
        <td><input type="text" name="main_post_ref[]" value="${entry.pr || ""}" placeholder="PR (ex. 110)" onchange="saveData()" required></td>
        <td><input type="number" name="debit[]" value="${entry.debit || ""}" min="0" step="0.01" onchange="saveData()" required></td>
        <td></td>
        <td><button type="button" class="btn btn-danger" onclick="deleteRow(this)">Remove</button></td>
    `;

    // Sub row
    const subRow = table.insertRow();
    subRow.innerHTML = `
        <td></td>
        <td><input type="text" name="sub_account_title[]" value="${entry.subAccount || ""}" placeholder="Sub Account Title" class="sub-account" onchange="saveData()" required></td>
        <td><input type="text" name="sub_post_ref[]" value="${entry.subPr || ""}" placeholder="PR (ex. 310)" onchange="saveData()" required></td>
        <td></td>
        <td><input type="number" name="credit[]" value="${entry.credit || ""}" min="0" step="0.01" onchange="saveData()" required></td>
        <td></td>
    `;

    // Description row
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
                accountType: '',
                accountTitle: entry.mainAccount,
                credit: 0
            });
        }
        if (entry.subPr && entry.subPr !== entry.pr) {
            if (!groups[entry.subPr]) groups[entry.subPr] = [];
            groups[entry.subPr].push({
                ...entry,
                accountType: "",
                accountTitle: entry.subAccount,
                debit: 0,
                credit: entry.credit
            });
        }
        return groups;
    }, {});

    Object.entries(groupedEntries).forEach(([prKey, entries]) => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("group");

        let groupTotal = 0; // Initialize group total for the posting reference

        // Header for the group
        groupDiv.innerHTML = `
            <div class="group-header">
                <div class="account-header">
                    <span class="account-title">${entries[0].accountTitle}</span> <!-- Removed parenthesis here -->
                    <span class="posting-ref">PR: ${prKey}</span>
                </div>
            </div>
            <table class="ledger-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Account</th>
                        <th>Journal Entry</th>
                        <th>DR</th>
                        <th>CR</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map((entry) => {
                        let adjustedDebit = entry.debit;
                        let adjustedCredit = entry.credit;
                        let entryTotal = 0;

                        if (/^[2-4]/.test(prKey)) {
                            // If PR starts with 2, 3, or 4, calculate Total = Credit - Debit
                            entryTotal = adjustedCredit - adjustedDebit;
                        } else {
                            // If PR starts with 1 or 5, calculate Total = Debit - Credit
                            entryTotal = adjustedDebit - adjustedCredit;
                        }

                        // Accumulate the total for the posting reference
                        groupTotal += entryTotal;

                        return `
                            <tr>
                                <td>${entry.date}</td>
                                <td>${entry.description} </td> <!-- Removed the account type here -->
                                <td>J1</td>
                                <td>${adjustedDebit}</td>
                                <td>${adjustedCredit}</td>
                                <td>${entryTotal}</td>
                            </tr>
                        `;
                    }).join("")}
                    <tr class="group-total">
                        <td colspan="5">Total</td>
                        <td>${groupTotal}</td>
                    </tr>
                </tbody>
            </table>
        `;

        ledgerContainer.appendChild(groupDiv);
    });
}


function deleteall() {
    localStorage.removeItem("journalEntries");
    document.getElementById("inputTable").querySelector("tbody").innerHTML = "";
    updateLedger();
    updateTrialBalance();
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();
    updateLedger();
    updateTrialBalance();
});


function printPage() {
    window.print();
}

function updateTrialBalance() {
    const trialBalanceTable = document.getElementById("trialBalanceTable").querySelector("tbody");
    const debitTotalCell = document.getElementById("trialBalanceDebitTotal");
    const creditTotalCell = document.getElementById("trialBalanceCreditTotal");

    // Retrieve grouped ledger entries (from the ledger data)
    const groupedEntries = getGroupedEntriesFromLedger();  

    // Clear the trial balance table before updating
    trialBalanceTable.innerHTML = "";

    // Initialize total sums for Debit and Credit
    let totalDebit = 0;
    let totalCredit = 0;

    // Iterate over each group of entries (ledger group)
    groupedEntries.forEach(group => {
        const { pr, groupTotal, accountTitle } = group;

        // Use the account title directly from the ledger entry, no need to modify
        // Remove any extra text like "PR"
        const accountTitleWithoutPR = accountTitle.split('PR')[0].trim();

        // Determine whether to place groupTotal in Debit or Credit based on PR
        let debit = 0;
        let credit = 0;

        if (/^[1|5]/.test(pr)) {
            debit = groupTotal; // If PR starts with 1 or 5, assign group total to Debit
        } else if (/^[2|3|4]/.test(pr)) {
            credit = groupTotal; // If PR starts with 2, 3, or 4, assign group total to Credit
        }

        // Add the values to the running total
        totalDebit += debit;
        totalCredit += credit;

        // Add the entry to the trial balance table
        const row = trialBalanceTable.insertRow();

        // Account Title, Debit, and Credit columns
        row.innerHTML = `
            <td>${accountTitleWithoutPR}</td>
            <td>${debit}</td>
            <td>${credit}</td>
        `;
    });

    // Update total debit and credit in the trial balance
    debitTotalCell.textContent = totalDebit.toFixed(2);
    creditTotalCell.textContent = totalCredit.toFixed(2);
}

// Function to get grouped entries based on ledger data
//para ito sa trial balance para yung mga nasa per group, basehan din kung anong pr nila
function getGroupedEntriesFromLedger() {
    const groupedEntries = [];
    
    const ledgerContainer = document.getElementById("ledgerGroups");  // Assuming the ledger is in this container

    // Get each group of ledger entries
    const groups = ledgerContainer.querySelectorAll(".group");
    groups.forEach(group => {
        const pr = group.querySelector(".group-header").textContent.split(":")[1].trim();  // Extract PR
        const accountTitle = group.querySelector(".group-header").textContent.split(":")[0].trim();  // Extract Account Title
        const groupTotal = parseFloat(group.querySelector(".group-total td:last-child").textContent);  // Get the group total

        groupedEntries.push({ pr, groupTotal, accountTitle });
    });

    return groupedEntries;
}
