const base44Mock = {
  entities: {
    DonationList: { filter: () => Promise.resolve([]) },
    DonationAction: { filter: () => Promise.resolve([]) }
  },
  auth: { 
    me: () => Promise.resolve(null) 
  },
  storage: {}
};

export const base44 = base44Mock;