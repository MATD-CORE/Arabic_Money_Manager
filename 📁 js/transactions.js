var Transactions = (function () {
    function setType(type) { S.txType = type; S.txCat = ''; updateTypeBtns(); renderCatGrid(); }
    function updateTypeBtns() {
        var bi = Utils.$('btnIncome'), be = Utils.$('btnExpense');
        if (S.txType === 'income') { bi.className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-success text-white'; be.className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; }
        else { bi.className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; be.className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-danger text-white'; }
    }
    function renderCatGrid() {
        var grid = Utils.$('catGrid'), cats = Utils.getCats(S.txType);
        grid.innerHTML = cats.map(function (c) { return '<button onclick="Transactions.pickCat(\'' + c.id + '\')" class="flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition ' + (S.txCat === c.id ? 'bg-white/15 border-blue-400/50' : 'bg-white/5 border-transparent') + '" data-c="' + c.id + '"><span class="text-lg">' + c.i + '</span><span class="text-[9px] text-gray-300">' + c.n + '</span></button>'; }).join('');
    }
    function pickCat(id) { S.txCat = id; document.querySelectorAll('#catGrid button').forEach(function (btn) { btn.className = btn.dataset.c === id ? 'flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition bg-white/15 border-blue-400/50' : 'flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition bg-white/5 border-transparent'; }); }
    function add() {
        var accId = parseInt(Utils.$('txAccount').value), amt = parseFloat(Utils.$('txAmount').value), desc = Utils.$('txDesc').value.trim(), date = Utils.$('txDate').value;
        if (!amt || amt <= 0) { Utils.toast('أدخل مبلغ صحيح', 'error'); return; }
        if (!S.txCat) { Utils.toast('اختر فئة', 'error'); return; }
        if (!accId) { Utils.toast('اختر حساب', 'error'); return; }
        var acc = Utils.findAcc(accId); if (!acc) { Utils.toast('الحساب غير موجود', 'error'); return; }
        if (S.txType === 'expense' && acc.balance < amt) { Utils.toast('رصيد غير كافٍ', 'error'); return; }
        var cat = Utils.findCat(S.txType, S.txCat);
        if (S.txType === 'income') acc.balance += amt; else acc.balance -= amt;
        S.txs.unshift({ id: Date.now(), accountId: accId, accountName: acc.name, accountIcon: ACC_TYPES[acc.type].i, type: S.txType, amount: amt, category: S.txCat, categoryName: cat.n, categoryIcon: cat.i, categoryColor: cat.c, description: desc, date: date, created: new Date().toISOString() });
        Utils.save(); UI.closeModal('addModal'); App.populateAccSelects(); Utils.toast(S.txType === 'income' ? 'تم إضافة الدخل ✓' : 'تم إضافة المصروف ✓'); App.refreshAll();
    }
    function html(t) {
        var isInc = t.type === 'income';
        return '<div class="glass-light rounded-xl p-2.5 flex items-center gap-2.5 card-hover group"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style="background:' + t.categoryColor + '20">' + t.categoryIcon + '</div><div class="flex-1 min-w-0"><p class="text-xs font-bold truncate">' + (t.description || t.categoryName) + '</p><p class="text-[10px] text-gray-400">' + t.accountIcon + ' ' + t.accountName + ' • ' + Utils.fd(t.date) + '</p></div><div class="flex items-center gap-1.5"><p class="text-xs font-bold ' + (isInc ? 'text-green-400' : 'text-red-400') + '">' + (isInc ? '+' : '-') + Utils.fc(t.amount) + '</p><button onclick="Transactions.openEdit(' + t.id + ')" class="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-blue-500/20 rounded-lg"><svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></button><button onclick="Transactions.remove(' + t.id + ')" class="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded-lg"><svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div></div>';
    }
    function openEdit(id) {
        var tx = null; for (var i = 0; i < S.txs.length; i++) { if (S.txs[i].id === id) { tx = S.txs[i]; break; } } if (!tx) return;
        S.editType = tx.type; S.editCat = tx.category;
        Utils.$('editTxId').value = id; Utils.$('editTxAmount').value = tx.amount; Utils.$('editTxDesc').value = tx.description || ''; Utils.$('editTxDate').value = tx.date;
        if (tx.type === 'income') { Utils.$('editBtnIncome').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-success text-white'; Utils.$('editBtnExpense').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; }
        else { Utils.$('editBtnIncome').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; Utils.$('editBtnExpense').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-danger text-white'; }
        App.populateAccSelects(); Utils.$('editTxAccount').value = tx.accountId; renderEditCatGrid(); UI.openModal('editModal');
    }
    function setEditType(type) { S.editType = type; S.editCat = ''; if (type === 'income') { Utils.$('editBtnIncome').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-success text-white'; Utils.$('editBtnExpense').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; } else { Utils.$('editBtnIncome').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition bg-white/5 text-gray-400'; Utils.$('editBtnExpense').className = 'flex-1 py-2.5 rounded-lg text-xs font-bold transition g-danger text-white'; } renderEditCatGrid(); }
    function renderEditCatGrid() {
        var grid = Utils.$('editCatGrid'), cats = Utils.getCats(S.editType);
        grid.innerHTML = cats.map(function (c) { return '<button onclick="Transactions.pickEditCat(\'' + c.id + '\')" class="flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition ' + (S.editCat === c.id ? 'bg-white/15 border-blue-400/50' : 'bg-white/5 border-transparent') + '" data-c="' + c.id + '"><span class="text-lg">' + c.i + '</span><span class="text-[9px] text-gray-300">' + c.n + '</span></button>'; }).join('');
    }
    function pickEditCat(id) { S.editCat = id; document.querySelectorAll('#editCatGrid button').forEach(function (btn) { btn.className = btn.dataset.c === id ? 'flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition bg-white/15 border-blue-400/50' : 'flex flex-col items-center gap-0.5 p-2 rounded-xl border-2 transition bg-white/5 border-transparent'; }); }
    function saveEdit() {
        var id = parseInt(Utils.$('editTxId').value), idx = -1; for (var i = 0; i < S.txs.length; i++) { if (S.txs[i].id === id) { idx = i; break; } } if (idx === -1) return;
        var old = S.txs[idx], newAccId = parseInt(Utils.$('editTxAccount').value), newAmt = parseFloat(Utils.$('editTxAmount').value), newDesc = Utils.$('editTxDesc').value.trim(), newDate = Utils.$('editTxDate').value;
        if (!newAmt || newAmt <= 0) { Utils.toast('أدخل مبلغ صحيح', 'error'); return; }
        if (!S.editCat) { Utils.toast('اختر فئة', 'error'); return; }
        if (!newAccId) { Utils.toast('اختر حساب', 'error'); return; }
        var newAcc = Utils.findAcc(newAccId); if (!newAcc) return;
        var oldAcc = Utils.findAcc(old.accountId); if (oldAcc) { if (old.type === 'income') oldAcc.balance -= old.amount; else oldAcc.balance += old.amount; }
        var cat = Utils.findCat(S.editType, S.editCat);
        if (S.editType === 'expense' && newAcc.balance < newAmt) { Utils.toast('رصيد غير كافٍ', 'error'); if (oldAcc) { if (old.type === 'income') oldAcc.balance += old.amount; else oldAcc.balance -= old.amount; } return; }
        if (S.editType === 'income') newAcc.balance += newAmt; else newAcc.balance -= newAmt;
        S.txs[idx] = { id: old.id, accountId: newAccId, accountName: newAcc.name, accountIcon: ACC_TYPES[newAcc.type].i, type: S.editType, amount: newAmt, category: S.editCat, categoryName: cat.n, categoryIcon: cat.i, categoryColor: cat.c, description: newDesc, date: newDate, created: old.created };
        Utils.save(); UI.closeModal('editModal'); App.populateAccSelects(); Utils.toast('تم التعديل ✓'); App.refreshAll();
    }
    function remove(id) {
        if (!confirm('حذف المعاملة؟')) return;
        var tx = null; for (var i = 0; i < S.txs.length; i++) { if (S.txs[i].id === id) { tx = S.txs[i]; break; } }
        if (tx) { var acc = Utils.findAcc(tx.accountId); if (acc) { if (tx.type === 'income') acc.balance -= tx.amount; else acc.balance += tx.amount; } }
        S.txs = S.txs.filter(function (t) { return t.id !== id; }); Utils.save(); App.populateAccSelects(); Utils.toast('تم الحذف'); App.refreshAll();
    }
    function filter(f, btn) { S.txFilter = f; document.querySelectorAll('.t-filter').forEach(function (b) { b.className = 't-filter flex-1 py-2 rounded-xl text-xs font-bold transition bg-white/5 text-gray-400'; }); btn.className = 't-filter active flex-1 py-2 rounded-xl text-xs font-bold transition g-primary'; render(); }
    function render() {
        var el = Utils.$('txList'), list = S.txs.slice();
        if (S.txFilter === 'income') list = list.filter(function (t) { return t.type === 'income'; });
        if (S.txFilter === 'expense') list = list.filter(function (t) { return t.type === 'expense'; });
        var af = Utils.$('txAccountFilter'); if (af && af.value !== 'all') { var aid = parseInt(af.value); list = list.filter(function (t) { return t.accountId === aid; }); }
        if (!list.length) { el.innerHTML = '<div class="text-center py-10 text-gray-500"><p class="text-sm">لا توجد معاملات</p></div>'; return; }
        el.innerHTML = list.map(function (t) { return html(t); }).join('');
    }
    return { setType: setType, updateTypeBtns: updateTypeBtns, renderCatGrid: renderCatGrid, pickCat: pickCat, add: add, html: html, openEdit: openEdit, setEditType: setEditType, renderEditCatGrid: renderEditCatGrid, pickEditCat: pickEditCat, saveEdit: saveEdit, remove: remove, filter: filter, render: render };
})();
