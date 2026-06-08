var Accounts = (function () {
    function openAddModal() {
        S.accType = ''; Utils.$('accName').value = ''; Utils.$('accBalance').value = ''; Utils.$('accNumber').value = ''; Utils.$('accNotes').value = '';
        document.querySelectorAll('.a-type-btn').forEach(function (b) { b.className = 'a-type-btn flex items-center gap-2 p-3 rounded-xl bg-white/5 border-2 border-transparent hover:bg-white/10 transition'; });
        UI.openModal('addAccModal');
    }
    function pickType(type) {
        S.accType = type;
        document.querySelectorAll('.a-type-btn').forEach(function (b) { b.className = b.dataset.t === type ? 'a-type-btn flex items-center gap-2 p-3 rounded-xl bg-white/15 border-2 border-blue-400/50 transition' : 'a-type-btn flex items-center gap-2 p-3 rounded-xl bg-white/5 border-2 border-transparent hover:bg-white/10 transition'; });
    }
    function add() {
        if (!S.accType) { Utils.toast('اختر النوع', 'error'); return; }
        var name = Utils.$('accName').value.trim(); if (!name) { Utils.toast('أدخل الاسم', 'error'); return; }
        S.accounts.push({ id: Date.now(), type: S.accType, name: name, balance: parseFloat(Utils.$('accBalance').value) || 0, number: Utils.$('accNumber').value.trim(), notes: Utils.$('accNotes').value.trim(), created: new Date().toISOString() });
        Utils.save(); UI.closeModal('addAccModal'); App.populateAccSelects(); Utils.toast('تم إضافة الحساب ✓'); App.refreshAll();
    }
    function openEdit(id) {
        var acc = Utils.findAcc(id); if (!acc) return;
        Utils.$('editAccId').value = id; Utils.$('editAccTypeDisp').textContent = ACC_TYPES[acc.type].i + ' ' + ACC_TYPES[acc.type].n;
        Utils.$('editAccName').value = acc.name; Utils.$('editAccBalance').value = acc.balance;
        Utils.$('editAccNumber').value = acc.number || ''; Utils.$('editAccNotes').value = acc.notes || '';
        UI.openModal('editAccModal');
    }
    function saveEdit() {
        var id = parseInt(Utils.$('editAccId').value), acc = Utils.findAcc(id); if (!acc) return;
        var name = Utils.$('editAccName').value.trim(); if (!name) { Utils.toast('أدخل الاسم', 'error'); return; }
        acc.name = name; acc.balance = parseFloat(Utils.$('editAccBalance').value) || 0;
        acc.number = Utils.$('editAccNumber').value.trim(); acc.notes = Utils.$('editAccNotes').value.trim();
        Utils.save(); UI.closeModal('editAccModal'); App.populateAccSelects(); Utils.toast('تم التعديل ✓'); App.refreshAll();
    }
    function deleteAcc() {
        var id = parseInt(Utils.$('editAccId').value);
        if (S.accounts.length <= 1) { Utils.toast('لا يمكن حذف آخر حساب', 'error'); return; }
        var txCount = 0; for (var i = 0; i < S.txs.length; i++) { if (S.txs[i].accountId === id) txCount++; }
        if (txCount > 0 && !confirm('الحساب يحتوي على ' + txCount + ' معاملة. سيتم حذفها. متابعة؟')) return;
        S.txs = S.txs.filter(function (t) { return t.accountId !== id; });
        S.accounts = S.accounts.filter(function (a) { return a.id !== id; });
        Utils.save(); UI.closeModal('editAccModal'); App.populateAccSelects(); Utils.toast('تم حذف الحساب'); App.refreshAll();
    }
    function render() {
        var el = Utils.$('accList'), list = S.accounts.slice();
        if (S.accFilter !== 'all') list = list.filter(function (a) { return a.type === S.accFilter; });
        if (!list.length) { el.innerHTML = '<div class="text-center py-10 text-gray-500"><p class="text-sm">لا توجد حسابات</p></div>'; return; }
        var total = 0; for (var i = 0; i < S.accounts.length; i++) total += S.accounts[i].balance;
        var html = '<div class="glass rounded-2xl p-4 mb-2"><p class="text-[10px] text-gray-400 mb-0.5">إجمالي الرصيد</p><p class="text-xl font-black">' + Utils.fc(total) + '</p></div>';
        html += list.map(function (acc) {
            var info = ACC_TYPES[acc.type], now = new Date();
            var monthTxs = S.txs.filter(function (t) { var d = new Date(t.date); return t.accountId === acc.id && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
            var mIn = 0, mOut = 0; for (var j = 0; j < monthTxs.length; j++) { if (monthTxs[j].type === 'income') mIn += monthTxs[j].amount; else mOut += monthTxs[j].amount; }
            return '<div class="' + info.g + ' rounded-2xl p-4 card-hover cursor-pointer" onclick="Accounts.openEdit(' + acc.id + ')"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><span class="text-xl">' + info.i + '</span><div><p class="font-bold text-sm">' + acc.name + '</p><p class="text-[10px] text-white/60">' + info.n + '</p></div></div><svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg></div><p class="text-xl font-black mb-2">' + Utils.fc(acc.balance) + '</p><div class="flex gap-2"><div class="glass-light rounded-lg px-2 py-1.5 flex-1"><p class="text-[9px] text-white/60">دخل الشهر</p><p class="text-xs font-bold text-green-300">+' + Utils.fc(mIn) + '</p></div><div class="glass-light rounded-lg px-2 py-1.5 flex-1"><p class="text-[9px] text-white/60">مصروف الشهر</p><p class="text-xs font-bold text-red-300">-' + Utils.fc(mOut) + '</p></div></div>' + (acc.number ? '<p class="text-[9px] text-white/40 mt-1.5 ltr text-left">' + acc.number + '</p>' : '') + '</div>';
        }).join('');
        el.innerHTML = html;
    }
    function filter(type, btn) {
        S.accFilter = type; document.querySelectorAll('.a-filter').forEach(function (b) { b.className = 'a-filter whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition bg-white/5 text-gray-400'; });
        btn.className = 'a-filter whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition g-primary text-white'; render();
    }
    return { openAddModal: openAddModal, pickType: pickType, add: add, openEdit: openEdit, saveEdit: saveEdit, delete: deleteAcc, render: render, filter: filter };
})();
