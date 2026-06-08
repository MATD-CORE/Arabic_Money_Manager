var UI = (function () {
    function openModal(id) { var el = Utils.$(id); if (el) el.classList.remove('hidden'); }
    function closeModal(id) { var el = Utils.$(id); if (el) el.classList.add('hidden'); }
    function toggleSettings() {
        var m = Utils.$('settingsModal');
        if (m.classList.contains('hidden')) { m.classList.remove('hidden'); Utils.$('currencySelect').value = S.currency; }
        else { closeModal('settingsModal'); }
    }
    function openAddTx() {
        if (S.accounts.length === 0) { Utils.toast('يرجى إضافة حساب أولاً', 'error'); return; }
        S.txType = 'income'; S.txCat = '';
        App.populateAccSelects();
        Utils.$('txAccount').value = S.accounts[0] ? S.accounts[0].id : '';
        Utils.$('txAmount').value = ''; Utils.$('txDesc').value = ''; Utils.$('txDate').value = Utils.today();
        Transactions.updateTypeBtns(); Transactions.renderCatGrid();
        openModal('addModal');
    }
    return { openModal: openModal, closeModal: closeModal, toggleSettings: toggleSettings, openAddTx: openAddTx };
})();
