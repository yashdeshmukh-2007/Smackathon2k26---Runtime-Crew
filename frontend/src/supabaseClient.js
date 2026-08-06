// Full Chainable LocalStorage Mock Client[cite: 2]
export const supabase = {
  from(tableName) {
    return {
      select(columns = '*') {
        const query = {
          eq(column, value) {
            query._eq = { column, value };
            return query;
          },
          order(column, options) {
            query._order = { column, options };
            return query;
          },
          limit(count) {
            query._limit = count;
            return query;
          },
          then(resolve, reject) {
            try {
              let data = JSON.parse(localStorage.getItem(`mock_${tableName}`) || '[]');
              
              // Apply .eq filter if present
              if (query._eq) {
                data = data.filter(item => item[query._eq.column] === query._eq.value);
              }

              // Apply order if present
              if (query._order) {
                const { column, options } = query._order;
                const ascending = options?.ascending ?? true;
                data.sort((a, b) => {
                  if (a[column] < b[column]) return ascending ? -1 : 1;
                  if (a[column] > b[column]) return ascending ? 1 : -1;
                  return 0;
                });
              }

              if (typeof query._limit === 'number') {
                data = data.slice(0, query._limit);
              }
              
              resolve({ data, error: null });
            } catch (err) {
              resolve({ data: [], error: err });
            }
          }
        };
        return query;
      },
      async insert(payload) {
        try {
          const existing = JSON.parse(localStorage.getItem(`mock_${tableName}`) || '[]');
          const items = Array.isArray(payload) ? payload : [payload];
          const inserted = items.map(item => ({
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36)),
            created_at: new Date().toISOString(),
            ...item
          }));
          const updated = [...inserted, ...existing];
          localStorage.setItem(`mock_${tableName}`, JSON.stringify(updated));
          return { data: inserted, error: null };
        } catch (err) {
          return { data: null, error: err };
        }
      }
    };
  }
};