var Transfers = (function () {
    function openModal() {
        if (S.accounts.length < 2) { Utils.toast('أضف حسابين على الأقل', 'error'); return; }
        App.populateAccSelects(); if (S.accounts.length >= 2) Utils.$('trTo').value = S.accounts[1].id;
        Utils.$('trAmount').value = ''; Utils.$('trDesc').value = ''; UI.openModal('transferModal');
    }
    function swap() { var f = Utils.$('trFrom'), t = Utils.$('trTo'), tmp = f.value; f.value = t.value; t.value = tmp; }
    function submit() {
        var fromId = parseInt(Utils.$('trFrom').value), toId = parseInt(Utils.$('trTo').value), amt = parseFloat(Utils.$('trAmount').value), desc = Utils.$('trDesc').value.trim();
        if (fromId === toId) { Utils.toast('لا يمكن التحويل لنفس الحساب', 'error'); return; }
        if (!amt || amt <= 0) { Utils.toast('أدخل مبلغ صحيح', 'error'); return; }
        var from = Utils.findAcc(fromId), to = Utils.findAcc(toId);
        if (!from || !to) { Utils.toast('حساب غير موجود', 'error'); return; }
        if (from.balance < amt) { Utils.toast('رصيد غير كافٍ', 'error'); return; }
        from.balance -= amt; to.balance += amt;
        S.transfers.unshift({ id: Date.now(), fromId: fromId, fromName: from.name, fromIcon: ACC_TYPES[from.type].i, toId: toId, toName: to.name, toIcon: ACC_TYPES[to.type].i, amount: amt, description: desc, date: Utils.today(), created: new Date().toISOString() });
        Utils.save(); UI.closeModal('transferModal'); App.populateAccSelects(); Utils.toast('تم التحويل ✓'); App.refreshAll();
    }
    function render() {
        var el = Utils.$('transferList');
        if (!S.transfers.length) { el.innerHTML = '<div class="text-center py-10 text-gray-500"><svg class="w-14 h-14 mx-auto mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m0 0l-4 4m0 6l4 4m0 0l-4-4m0 0H4"/></svg><p class="text-sm">لا توجد تحويلات</p></div>'; return; }
        el.innerHTML = S.transfers.map(function (t) { return '<div class="glass-light rounded-xl p-3 card-hover"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-xl g-warm flex items-center justify-center text-base">' + t.fromIcon + '</div><div class="flex-1"><div class="flex items-center gap-1.5"><p class="text-xs font-bold">' + t.fromName + '</p><svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg><p class="text-xs font-bold">' + t.toName + '</p></div><p class="text-[10px] text-gray-400">' + (t.description || 'تحويل') + ' • ' + Utils.fd(t.date) + '</p></div><p class="text-xs font-bold text-blue-400">' + Utils.fc(t.amount) + '</p></div></div>'; }).join('');
    }
    return { openModal: openModal, swap: swap, submit: submit, render: render };
})();
