var Utils = (function () {
    function formatNum(n) { return new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n || 0); }
    function fc(n) { return formatNum(n) + ' ' + S.currency; }
    function fd(d) { var dt = new Date(d); return dt.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }); }
    function today() { return new Date().toISOString().split('T')[0]; }
    function $(id) { return document.getElementById(id); }
    function toast(msg, type) {
        var t = $('toast'), ic = $('toastIcon');
        $('toastMsg').textContent = msg;
        if (type === 'error') {
            ic.className = 'w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center';
            ic.innerHTML = '<svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
        } else {
            ic.className = 'w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center';
            ic.innerHTML = '<svg class="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        }
        t.classList.remove('hidden');
        setTimeout(function () { t.classList.add('hidden'); }, 2200);
    }
    function save() { try { localStorage.setItem('mm_v3', JSON.stringify({ a: S.accounts, t: S.txs, tr: S.transfers, b: S.budget, cb: S.catBudgets, cur: S.currency })); } catch (e) { console.error('Save failed:', e); } }
    function load() {
        try {
            var raw = localStorage.getItem('mm_v3');
            if (raw) { var p = JSON.parse(raw); S.accounts = p.a || []; S.txs = p.t || []; S.transfers = p.tr || []; S.budget = p.b || 0; S.catBudgets = p.cb || {}; S.currency = p.cur || 'ر.س'; }
        } catch (e) { console.error('Load failed:', e); }
        if (S.accounts.length === 0) {
            S.accounts.push({ id: Date.now(), type: 'cash', name: 'نقد', balance: 0, number: '', notes: '', created: new Date().toISOString() });
            save();
        }
    }
    function getCats(type) { return type === 'income' ? INC_CATS : EXP_CATS; }
    function findCat(type, id) { var cats = getCats(type); for (var i = 0; i < cats.length; i++) { if (cats[i].id === id) return cats[i]; } return cats[0]; }
    function findAcc(id) { for (var i = 0; i < S.accounts.length; i++) { if (S.accounts[i].id === id) return S.accounts[i]; } return null; }
    function getMonthTxs() { var now = new Date(); return S.txs.filter(function (t) { var d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }); }
    return { formatNum: formatNum, fc: fc, fd: fd, today: today, $: $, toast: toast, save: save, load: load, getCats: getCats, findCat: findCat, findAcc: findAcc, getMonthTxs: getMonthTxs };
})();
