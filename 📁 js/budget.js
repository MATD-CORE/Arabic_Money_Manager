var Budget = (function () {
    function render() {
        var now = new Date(), monthTxs = Utils.getMonthTxs(), mExp = 0;
        for (var i = 0; i < monthTxs.length; i++) { if (monthTxs[i].type === 'expense') mExp += monthTxs[i].amount; }
        var rem = S.budget - mExp; Utils.$('budgetRemaining').textContent = Utils.fc(Math.max(0, rem));
        if (S.budget > 0) {
            var pct = Math.min((mExp / S.budget) * 100, 100);
            Utils.$('budgetBar').style.width = pct + '%';
            Utils.$('budgetBar').className = 'progress-bar h-full rounded-full ' + (pct > 80 ? 'bg-gradient-to-l from-red-500 to-orange-500' : pct > 50 ? 'bg-gradient-to-l from-yellow-500 to-orange-500' : 'g-success');
            Utils.$('budgetTotalLbl').textContent = Utils.fc(S.budget); Utils.$('budgetInfo').textContent = 'تم صرف ' + Utils.fc(mExp) + ' من ' + Utils.fc(S.budget);
        } else { Utils.$('budgetBar').style.width = '0%'; Utils.$('budgetTotalLbl').textContent = '0'; Utils.$('budgetInfo').textContent = 'لم تحدد ميزانية'; }
        renderCats(mExp);
    }
    function getCatKeyByIcon(icon) { for (var i = 0; i < EXP_CATS.length; i++) { if (EXP_CATS[i].i === icon) return EXP_CATS[i].id; } return ''; }
    function renderCats(totalExp) {
        var el = Utils.$('budgetCats'), now = new Date();
        var exps = S.txs.filter(function (t) { var d = new Date(t.date); return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
        var totals = {};
        for (var i = 0; i < exps.length; i++) { var cat = exps[i].category; if (!totals[cat]) totals[cat] = { n: exps[i].categoryName, i: exps[i].categoryIcon, c: exps[i].categoryColor, total: 0 }; totals[cat].total += exps[i].amount; }
        var sorted = Object.values(totals).sort(function (a, b) { return b.total - a.total; });
        if (!sorted.length) { el.innerHTML = '<div class="text-center py-5 text-gray-500 text-xs">لا توجد مصروفات</div>'; return; }
        el.innerHTML = sorted.map(function (cat) {
            var catB = S.catBudgets[cat.n] || S.catBudgets[getCatKeyByIcon(cat.i)] || 0;
            var pct = catB > 0 ? Math.min((cat.total / catB) * 100, 100) : (totalExp > 0 ? ((cat.total / totalExp) * 100).toFixed(0) : 0);
            var over = catB > 0 && cat.total > catB;
            return '<div class="glass-light rounded-xl p-3"><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg flex items-center justify-center text-base" style="background:' + cat.c + '20">' + cat.i + '</div><div class="flex-1"><div class="flex items-center justify-between"><span class="text-xs font-bold">' + cat.n + '</span><span class="text-xs font-bold ' + (over ? 'text-red-400' : '') + '" style="' + (over ? '' : 'color:' + cat.c) + '">' + Utils.fc(cat.total) + '</span></div>' + (catB > 0 ? '<p class="text-[9px] text-gray-400">الميزانية: ' + Utils.fc(catB) + (over ? ' ⚠️' : '') + '</p>' : '') + '</div></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden"><div class="h-full rounded-full progress-bar" style="width:' + pct + '%;background:' + (over ? '#ef4444' : cat.c) + '"></div></div></div>';
        }).join('');
    }
    function save() { var amt = parseFloat(Utils.$('budgetInput').value); if (amt > 0) { S.budget = amt; Utils.save(); UI.closeModal('budgetModal'); Utils.toast('تم الحفظ ✓'); render(); } else { Utils.toast('أدخل مبلغ صحيح', 'error'); } }
    function openCatModal() {
        var el = Utils.$('catBudgetList');
        el.innerHTML = EXP_CATS.map(function (cat) { var val = S.catBudgets[cat.id] || ''; return '<div class="flex items-center gap-2"><div class="w-8 h-8 rounded-lg flex items-center justify-center text-base" style="background:' + cat.c + '20">' + cat.i + '</div><div class="flex-1"><label class="text-xs font-bold">' + cat.n + '</label><input type="number" id="cb_' + cat.id + '" value="' + val + '" placeholder="بدون حد" class="w-full glass-light rounded-lg px-2 py-1.5 text-xs mt-0.5 text-left ltr border border-white/10"></div></div>'; }).join('');
        UI.openModal('catBudgetModal');
    }
    function saveCatBudgets() { S.catBudgets = {}; EXP_CATS.forEach(function (cat) { var v = parseFloat(Utils.$('cb_' + cat.id).value); if (v > 0) S.catBudgets[cat.id] = v; }); Utils.save(); UI.closeModal('catBudgetModal'); Utils.toast('تم الحفظ ✓'); render(); }
    return { render: render, save: save, openCatModal: openCatModal, saveCatBudgets: saveCatBudgets };
})();
