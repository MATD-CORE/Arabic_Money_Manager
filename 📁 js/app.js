var App = (function () {
    function init() {
        Utils.load(); addDemo();
        Utils.$('currentDate').textContent = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        populateAccSelects(); Utils.$('txDate').value = Utils.today();
        updateDash();
        setTimeout(function () { Charts.refresh(); Charts.renderMonthly(); }, 150);
    }
    function navigate(viewId) {
        var views = ['view-dashboard', 'view-transactions', 'view-analytics', 'view-budget', 'view-accounts', 'view-transfers'];
        views.forEach(function (v) { var el = Utils.$(v); if (el) el.classList.add('hidden'); });
        var target = Utils.$(viewId); if (target) target.classList.remove('hidden');
        var navItems = document.querySelectorAll('.nav-item'); navItems.forEach(function (n) { n.classList.remove('active'); });
        var map = { 'view-dashboard': 0, 'view-transactions': 1, 'view-analytics': 3, 'view-more': 4 };
        if (map[viewId] !== undefined && navItems[map[viewId]]) navItems[map[viewId]].classList.add('active');
        switch (viewId) {
            case 'view-transactions': populateAccSelects(); Transactions.render(); break;
            case 'view-analytics': renderAnalytics(); break;
            case 'view-budget': Budget.render(); break;
            case 'view-accounts': Accounts.render(); break;
            case 'view-transfers': Transfers.render(); break;
            case 'view-dashboard': updateDash(); break;
        }
    }
    function populateAccSelects() {
        var opts = S.accounts.map(function (a) { return '<option value="' + a.id + '">' + ACC_TYPES[a.type].i + ' ' + a.name + ' (' + Utils.fc(a.balance) + ')</option>'; }).join('');
        ['txAccount', 'editTxAccount', 'trFrom', 'trTo'].forEach(function (id) { var el = Utils.$(id); if (el) el.innerHTML = opts; });
        var af = Utils.$('txAccountFilter'); if (af) { var html = '<option value="all">جميع الحسابات</option>'; S.accounts.forEach(function (a) { html += '<option value="' + a.id + '">' + ACC_TYPES[a.type].i + ' ' + a.name + '</option>'; }); af.innerHTML = html; }
    }
    function updateDash() {
        var totalBal = 0, totalInc = 0, totalExp = 0;
        for (var i = 0; i < S.accounts.length; i++) totalBal += S.accounts[i].balance;
        for (var i = 0; i < S.txs.length; i++) { if (S.txs[i].type === 'income') totalInc += S.txs[i].amount; else totalExp += S.txs[i].amount; }
        Utils.$('totalBalance').textContent = Utils.fc(totalBal); Utils.$('totalIncome').textContent = Utils.fc(totalInc); Utils.$('totalExpense').textContent = Utils.fc(totalExp);
        var monthTxs = Utils.getMonthTxs(), mInc = 0, mExp = 0;
        for (var i = 0; i < monthTxs.length; i++) { if (monthTxs[i].type === 'income') mInc += monthTxs[i].amount; else mExp += monthTxs[i].amount; }
        Utils.$('monthIncome').textContent = Utils.fc(mInc); Utils.$('monthExpense').textContent = Utils.fc(mExp);
        renderAccSummary(); renderRecent(); Charts.refresh();
    }
    function renderAccSummary() {
        var el = Utils.$('accountSummaryList');
        if (!S.accounts.length) { el.innerHTML = '<p class="text-center text-gray-500 text-xs py-3">أضف حساباً</p>'; return; }
        el.innerHTML = S.accounts.map(function (acc) { var info = ACC_TYPES[acc.type]; return '<div class="glass-light rounded-xl p-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition" onclick="App.navigate(\'view-accounts\')"><div class="w-9 h-9 rounded-lg ' + info.g + ' flex items-center justify-center text-base">' + info.i + '</div><div class="flex-1"><p class="text-xs font-bold">' + acc.name + '</p><p class="text-[9px] text-gray-400">' + info.n + '</p></div><p class="text-xs font-bold">' + Utils.fc(acc.balance) + '</p></div>'; }).join('');
    }
    function renderRecent() { var el = Utils.$('recentTransactions'), recent = S.txs.slice(0, 5); if (!recent.length) { el.innerHTML = '<div class="text-center py-6 text-gray-500"><p class="text-xs">لا توجد معاملات</p></div>'; return; } el.innerHTML = recent.map(function (t) { return Transactions.html(t); }).join(''); }
    function renderAnalytics() { renderCatBreakdown(); Charts.refresh(); Charts.renderMonthly(); }
    function renderCatBreakdown() {
        var el = Utils.$('catBreakdown'), exps = S.txs.filter(function (t) { return t.type === 'expense'; }), total = 0;
        for (var i = 0; i < exps.length; i++) total += exps[i].amount;
        if (!total) { el.innerHTML = '<div class="text-center py-5 text-gray-500 text-xs">لا توجد مصروفات</div>'; return; }
        var totals = {}; for (var i = 0; i < exps.length; i++) { var cat = exps[i].category; if (!totals[cat]) totals[cat] = { n: exps[i].categoryName, i: exps[i].categoryIcon, c: exps[i].categoryColor, total: 0 }; totals[cat].total += exps[i].amount; }
        var sorted = Object.values(totals).sort(function (a, b) { return b.total - a.total; });
        el.innerHTML = sorted.map(function (cat) { var pct = ((cat.total / total) * 100).toFixed(1); return '<div class="flex items-center gap-2.5"><div class="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style="background:' + cat.c + '20">' + cat.i + '</div><div class="flex-1"><div class="flex items-center justify-between mb-1"><span class="text-xs font-bold">' + cat.n + '</span><span class="text-[10px] text-gray-400">' + Utils.fc(cat.total) + ' (' + pct + '%)</span></div><div class="h-1.5 bg-white/10 rounded-full overflow-hidden"><div class="h-full rounded-full progress-bar" style="width:' + pct + '%;background:' + cat.c + '"></div></div></div></div>'; }).join('');
    }
    function changeCurrency() { S.currency = Utils.$('currencySelect').value; Utils.save(); populateAccSelects(); refreshAll(); Utils.toast('تم تغيير العملة'); }
    function exportData() {
        var data = JSON.stringify({ a: S.accounts, t: S.txs, tr: S.transfers, b: S.budget, cb: S.catBudgets, cur: S.currency }, null, 2);
        var blob = new Blob([data], { type: 'application/json' }), url = URL.createObjectURL(blob);
        var a = document.createElement('a'); a.href = url; a.download = 'money-backup-' + Utils.today() + '.json'; a.click(); URL.revokeObjectURL(url);
        UI.closeModal('settingsModal'); Utils.toast('تم التصدير');
    }
    function clearData() {
        if (!confirm('حذف جميع البيانات؟')) return;
        S.txs = []; S.transfers = []; S.accounts = []; S.budget = 0; S.catBudgets = {};
        S.accounts.push({ id: Date.now(), type: 'cash', name: 'نقد', balance: 0, number: '', notes: '', created: new Date().toISOString() });
        Utils.save(); populateAccSelects(); UI.closeModal('settingsModal'); refreshAll(); Utils.toast('تم الحذف');
    }
    function refreshAll() { updateDash(); var activeView = document.querySelector('[id^="view-"]:not(.hidden)'); if (activeView) { switch (activeView.id) { case 'view-transactions': Transactions.render(); break; case 'view-analytics': renderAnalytics(); break; case 'view-budget': Budget.render(); break; case 'view-accounts': Accounts.render(); break; case 'view-transfers': Transfers.render(); break; } } }
    function addDemo() {
        if (S.txs.length > 0 || S.accounts.length > 1) return;
        S.accounts.push({ id: Date.now() + 1, type: 'bank', name: 'حساب الراجحي', balance: 25000, number: '****4521', notes: '', created: new Date().toISOString() }, { id: Date.now() + 2, type: 'wallet', name: 'STC Pay', balance: 1500, number: '', notes: '', created: new Date().toISOString() }, { id: Date.now() + 3, type: 'savings', name: 'حساب الادخار', balance: 50000, number: '****7893', notes: 'للطوارئ', created: new Date().toISOString() });
        var now = new Date(), demos = [
            { type: 'income', amt: 15000, cat: 'salary', acc: 0, desc: 'راتب شهري', days: 1 }, { type: 'income', amt: 3000, cat: 'freelance', acc: 0, desc: 'مشروع تصميم', days: 5 }, { type: 'income', amt: 500, cat: 'gift', acc: 1, desc: 'هدية', days: 3 },
            { type: 'expense', amt: 2500, cat: 'housing', acc: 0, desc: 'إيجار', days: 1 }, { type: 'expense', amt: 800, cat: 'food', acc: 2, desc: 'بقالة', days: 3 }, { type: 'expense', amt: 200, cat: 'transport', acc: 2, desc: 'بنزين', days: 7 },
            { type: 'expense', amt: 500, cat: 'shopping', acc: 1, desc: 'ملابس', days: 10 }, { type: 'expense', amt: 150, cat: 'entertainment', acc: 1, desc: 'نتفليكس', days: 12 }, { type: 'expense', amt: 300, cat: 'bills', acc: 0, desc: 'كهرباء', days: 15 }, { type: 'expense', amt: 100, cat: 'health', acc: 2, desc: 'صيدلية', days: 8 }
        ];
        demos.forEach(function (d) {
            var acc = S.accounts[d.acc], cat = Utils.findCat(d.type, d.cat), date = new Date(now); date.setDate(date.getDate() - d.days);
            if (d.type === 'income') acc.balance += d.amt; else acc.balance -= d.amt;
            S.txs.push({ id: Date.now() + Math.random() * 100000, accountId: acc.id, accountName: acc.name, accountIcon: ACC_TYPES[acc.type].i, type: d.type, amount: d.amt, category: d.cat, categoryName: cat.n, categoryIcon: cat.i, categoryColor: cat.c, description: d.desc, date: date.toISOString().split('T')[0], created: new Date().toISOString() });
        });
        S.transfers.push({ id: Date.now() + 1, fromId: S.accounts[0].id, fromName: S.accounts[0].name, fromIcon: ACC_TYPES[S.accounts[0].type].i, toId: S.accounts[3] ? S.accounts[3].id : S.accounts[0].id, toName: S.accounts[3] ? S.accounts[3].name : S.accounts[0].name, toIcon: ACC_TYPES[S.accounts[3] ? S.accounts[3].type : S.accounts[0].type].i, amount: 5000, description: 'تحويل للادخار', date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString().split('T')[0], created: new Date().toISOString() });
        S.budget = 10000; S.catBudgets = { food: 2000, transport: 500, shopping: 1000, entertainment: 300, bills: 500, housing: 3000 };
        Utils.save();
    }
    return { init: init, navigate: navigate, populateAccSelects: populateAccSelects, updateDash: updateDash, renderAnalytics: renderAnalytics, changeCurrency: changeCurrency, exportData: exportData, clearData: clearData, refreshAll: refreshAll };
})();

document.addEventListener('DOMContentLoaded', App.init);
if (document.readyState !== 'loading') App.init();
