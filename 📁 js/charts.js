var Charts = (function () {
    var charts = {};
    function refresh() { renderExpenseChart(); renderCategoryChart(); }
    function renderExpenseChart() {
        var periodEl = Utils.$('chartPeriod'), period = periodEl ? periodEl.value : 'month';
        var exps = S.txs.filter(function (t) { return t.type === 'expense'; });
        if (period === 'week') { var w = new Date(); w.setDate(w.getDate() - 7); exps = exps.filter(function (t) { return new Date(t.date) >= w; }); }
        var totals = {};
        for (var i = 0; i < exps.length; i++) { var cat = exps[i].category; if (!totals[cat]) totals[cat] = { n: exps[i].categoryName, c: exps[i].categoryColor, total: 0 }; totals[cat].total += exps[i].amount; }
        var sorted = Object.values(totals).sort(function (a, b) { return b.total - a.total; });
        if (charts.expense) charts.expense.destroy();
        charts.expense = new Chart(Utils.$('expenseChart').getContext('2d'), { type: 'bar', data: { labels: sorted.map(function(c){return c.n}), datasets: [{ data: sorted.map(function(c){return c.total}), backgroundColor: sorted.map(function(c){return c.c+'bb'}), borderRadius: 6, barPercentage: 0.6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af', font: { family: 'Tajawal', size: 9 } }, grid: { display: false } }, y: { ticks: { color: '#6b7280', font: { family: 'Tajawal', size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
    }
    function renderCategoryChart() {
        var exps = S.txs.filter(function (t) { return t.type === 'expense'; }), totals = {};
        for (var i = 0; i < exps.length; i++) { var cat = exps[i].category; if (!totals[cat]) totals[cat] = { n: exps[i].categoryName, c: exps[i].categoryColor, total: 0 }; totals[cat].total += exps[i].amount; }
        var sorted = Object.values(totals).sort(function (a, b) { return b.total - a.total; });
        if (charts.category) charts.category.destroy();
        charts.category = new Chart(Utils.$('categoryChart').getContext('2d'), { type: 'doughnut', data: { labels: sorted.map(function(c){return c.n}), datasets: [{ data: sorted.map(function(c){return c.total}), backgroundColor: sorted.map(function(c){return c.c+'cc'}), borderColor: '#1e1e2e', borderWidth: 3, hoverOffset: 8 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { family: 'Tajawal', size: 10 }, boxWidth: 10, padding: 8 } } } } });
    }
    function renderMonthly() {
        var labels = [], incD = [], expD = [];
        for (var i = 5; i >= 0; i--) {
            var d = new Date(); d.setMonth(d.getMonth() - i); labels.push(d.toLocaleDateString('ar-SA', { month: 'short' }));
            var mTx = S.txs.filter(function (t) { var td = new Date(t.date); return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear(); });
            var inc = 0, exp = 0; for (var j = 0; j < mTx.length; j++) { if (mTx[j].type === 'income') inc += mTx[j].amount; else exp += mTx[j].amount; }
            incD.push(inc); expD.push(exp);
        }
        if (charts.monthly) charts.monthly.destroy();
        charts.monthly = new Chart(Utils.$('monthlyChart').getContext('2d'), { type: 'bar', data: { labels: labels, datasets: [{ label: 'الدخل', data: incD, backgroundColor: 'rgba(34,197,94,0.6)', borderRadius: 5, barPercentage: 0.4 }, { label: 'المصروفات', data: expD, backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 5, barPercentage: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Tajawal', size: 10 }, boxWidth: 10 } } }, scales: { x: { ticks: { color: '#6b7280', font: { family: 'Tajawal', size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#6b7280', font: { family: 'Tajawal', size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } } } } });
    }
    return { refresh: refresh, renderMonthly: renderMonthly };
})();
