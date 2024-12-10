const accounts = {
    "101": "Cash",
    "102": "Petty Cash",
    "103": "Accounts Receivable",
    "104": "Allowance for Doubtful Accounts",
    "105": "Inventory",
    "106": "Prepaid Expenses",
    "107": "Investments",
    "108": "Property, Plant, and Equipment (PPE)",
    "109": "Accumulated Depreciation",
    "110": "Intangible Assets",
    "201": "Accounts Payable",
    "202": "Notes Payable",
    "203": "Accrued Liabilities",
    "204": "Unearned Revenue",
    "205": "Short-Term Debt",
    "206": "Long-Term Debt",
    "301": "Common Stock",
    "302": "Preferred Stock",
    "303": "Retained Earnings",
    "304": "Additional Paid-In Capital",
    "305": "Treasury Stock",
    "306": "Dividends Declared",
    "401": "Sales Revenue",
    "402": "Service Revenue",
    "403": "Interest Revenue",
    "404": "Other Revenue",
    "501": "Cost of Goods Sold (COGS)",
    "502": "Salaries Expense",
    "503": "Rent Expense",
    "504": "Utilities Expense",
    "505": "Depreciation Expense",
    "506": "Supplies Expense",
    "507": "Advertising Expense",
    "508": "Insurance Expense",
    "509": "Miscellaneous Expense",
    "601": "Gain on Sale of Assets",
    "602": "Loss on Sale of Assets",
    "603": "Unrealized Gain on Investments",
    "604": "Unrealized Loss on Investments"
};


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
            description: "",
            mainAccountName: "", // Add this field to store account name
            subAccountName: ""  // Add this field to store sub-account name
        };

        // Capture main row inputs
        inputs.main.forEach((input) => {
            if (input.name === "date[]") entry.date = input.value || "";
            if (input.name === "main_account_title[]") entry.mainAccount = input.value || "";
            if (input.name === "main_post_ref[]") {
                entry.pr = input.value || "";
                entry.mainAccountName = accounts[entry.pr] || ""; // Get the account name based on PR
            }
            if (input.name === "debit[]") entry.debit = parseFloat(input.value) || 0;
        });

        // Capture sub row inputs
        inputs.sub.forEach((input) => {
            if (input.name === "sub_account_title[]") entry.subAccount = input.value || "";
            if (input.name === "sub_post_ref[]") {
                entry.subPr = input.value || "";
                entry.subAccountName = accounts[entry.subPr] || ""; // Get the sub-account name based on PR
            }
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
        <td>
            <button type="button" class="btn btn-danger" onclick="deleteRow(this)">Remove</button>
            <button type="button" class="btn btn-warning" onclick="lockRow(this)">Lock</button>
            <button type="button" class="btn btn-success hidden" onclick="unlockRow(this)">Unlock</button>
        </td>
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

// Lock row inputs
function lockRow(button) {
    const row = button.closest("tr").parentElement; // Get the parent row (main, sub, description)
    const inputs = row.querySelectorAll("input");

    // Disable inputs
    inputs.forEach(input => {
        input.disabled = true;
    });

    // Show unlock button and hide lock button
    button.classList.add("hidden");
    const unlockButton = button.nextElementSibling;
    unlockButton.classList.remove("hidden");
}

// Unlock row inputs
function unlockRow(button) {
    const row = button.closest("tr").parentElement; // Get the parent row (main, sub, description)
    const inputs = row.querySelectorAll("input");

    // Enable inputs
    inputs.forEach(input => {
        input.disabled = false;
    });

    // Show lock button and hide unlock button
    button.classList.add("hidden");
    const lockButton = button.previousElementSibling;
    lockButton.classList.remove("hidden");
}



function deleteRow(button) {
    const row = button.closest("tr"); //find the closest row to delete
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
                accountTitle: entry.mainAccountName || entry.mainAccount, // Use account name if available
                credit: 0
            });
        }
        if (entry.subPr && entry.subPr !== entry.pr) {
            if (!groups[entry.subPr]) groups[entry.subPr] = [];
            groups[entry.subPr].push({
                ...entry,
                accountType: "",
                accountTitle: entry.subAccountName || entry.subAccount, // Use sub-account name if available
                debit: 0,
                credit: entry.credit
            });
        }
        return groups;
    }, {});

    Object.entries(groupedEntries).forEach(([prKey, entries]) => {
        const groupDiv = document.createElement("div");
        groupDiv.classList.add("group");

        let groupTotal = 0;

        // Header for the group
        groupDiv.innerHTML = `
            <div class="group-header">
                <div class="account-header">
                    <span class="account-title">${entries[0].accountTitle}</span>
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
                            entryTotal = adjustedCredit - adjustedDebit;
                        } else {
                            entryTotal = adjustedDebit - adjustedCredit;
                        }

                        groupTotal += entryTotal;

                        return `
                            <tr>
                                <td>${entry.date}</td>
                                <td>${entry.description}</td>
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
