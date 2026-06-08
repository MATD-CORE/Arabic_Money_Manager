var INC_CATS = [
    { id: 'salary', n: 'راتب', i: '💰', c: '#22c55e' },
    { id: 'freelance', n: 'عمل حر', i: '💻', c: '#3b82f6' },
    { id: 'investment', n: 'استثمار', i: '📈', c: '#8b5cf6' },
    { id: 'gift', n: 'هدية', i: '🎁', c: '#ec4899' },
    { id: 'other_in', n: 'أخرى', i: '💵', c: '#f59e0b' }
];

var EXP_CATS = [
    { id: 'food', n: 'طعام', i: '🍔', c: '#ef4444' },
    { id: 'transport', n: 'مواصلات', i: '🚗', c: '#3b82f6' },
    { id: 'shopping', n: 'تسوق', i: '🛍️', c: '#ec4899' },
    { id: 'health', n: 'صحة', i: '🏥', c: '#22c55e' },
    { id: 'education', n: 'تعليم', i: '📚', c: '#8b5cf6' },
    { id: 'entertainment', n: 'ترفيه', i: '🎮', c: '#f59e0b' },
    { id: 'bills', n: 'فواتير', i: '📄', c: '#6366f1' },
    { id: 'housing', n: 'سكن', i: '🏠', c: '#14b8a6' },
    { id: 'clothing', n: 'ملابس', i: '👔', c: '#a855f7' },
    { id: 'other_ex', n: 'أخرى', i: '📦', c: '#6b7280' }
];

var ACC_TYPES = {
    bank:    { i: '🏦', n: 'بنكي', g: 'g-bank' },
    wallet:  { i: '📱', n: 'محفظة', g: 'g-wallet' },
    cash:    { i: '💵', n: 'نقد', g: 'g-cash' },
    savings: { i: '💎', n: 'ادخار', g: 'g-saving' }
};

var S = {
    accounts: [], txs: [], transfers: [], budget: 0, catBudgets: {}, currency: 'ر.س',
    txType: 'income', txCat: '', accType: '', editType: 'income', editCat: '',
    txFilter: 'all', accFilter: 'all'
};
