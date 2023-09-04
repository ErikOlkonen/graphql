export let initialQuery = `query { user { id login createdAt } }`;

// export let levelQuery = `query { transaction(where: {userId: {_eq: ${userId} }, type: {_eq: "level"}, ` + `object: {type: {_nregex: "exercise|raid"}}} limit: 1 offset: 0 ` + `order_by: {amount: desc}) { amount } }`;

// queries.js
export function getUserLevelQuery(userId) {
    return `
    query {
      transaction(
        where: { userId: { _eq: ${userId} }, type: { _eq: "level" }, object: { type: { _nregex: "exercise|raid" } } }
        limit: 1
        offset: 0
        order_by: { amount: desc }
      ) {
        amount
      }
    }
  `;
}

// queries.js
export function getUserXPQuery(userId) {
    return `
    query {
      xpTransaction: transaction_aggregate(
        where: { userId: { _eq: ${userId} }, type: { _eq: "xp" }, object: { type: { _nregex: "exercise|raid" } } }
        limit: 500
        offset: 0
        order_by: { amount: desc }
      ) {
        aggregate {
          count
          sum {
            amount
          }
        }
      }
    }
  `;
}

export function getAuditRatio(userId) {
    return `
    query {
  aggregate_done: transaction_aggregate( 
    where: {userId: {_eq: ${userId} }, type: {_eq: "up"}}
  ) {
    aggregate {
      count
      sum {
        amount
      }
    }
  }
    
  aggregate_received: transaction_aggregate(
    where: {userId: {_eq: ${userId} }, type: {_eq: "down"}}
  ) {
    aggregate {
      count
      sum {
        amount
      }
    }
  }
}`;
}

export function getAuditInfo(userId) {
    return `
    query {
  done : transaction(
    where: {userId: {_eq: ${userId}},type: {_eq: "up"}}
    # object: {type: {_regex: "project"}}
    order_by: {amount: desc}
  ) { 
    object{type name id}
    amount
  }
}`;
}