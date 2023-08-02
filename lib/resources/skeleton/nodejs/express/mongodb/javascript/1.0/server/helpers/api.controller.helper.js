const { ENUM: { ROLE } } = require('../helpers/constant.helper');

function generateMatchFilter({
  //! isPermanentDelete is the flag to check if the query is for permanent delete
  //! if isPermanentDelete is true, then isActive will not be added to the query
  isPermanentDelete = false,

  //! query is the query object that needs to be converted to match filter
  query = {},
  
  //! regexFields is the array of fields that need to be regex matched
  //! regexFields must be an array of fields that are of type string in mongodb schema
  //! eg. { name: 'abc' } will be converted to { name: { $regex: 'abc', $options: 'i' } }
  regexFields = [],
  
  //! searchFields is the array of fields that need to be searched by 'search' in query
  //! if the field starts with '+', then it will be matched as number, otherwise it will be matched as string
  //! eg. { name: 'abc' } will be converted to { name: { $regex: 'abc', $options: 'i' } }
  //! eg. { +age: 18 } will be converted to { age: 18 }
  searchFields = [],
  
  //! rangeFields is the array of fields that need to be range matched
  //! eg. { ageRange: [18, 25] } will be converted to { age: { $gte: 18, $lte: 25 } }
  rangeFields = [],
  
  //! inFields is the array of fields that need to be in matched 
  //! eg. { category__In__: ['abc', 'xyz'] } will be converted to { category: { $in: ['abc', 'xyz'] } }
  inFields = [],
} = {}) {
  query = { ...query };
  if (!isPermanentDelete && !query.isAll && !("isActive" in query)) query.isActive = true;
  query['$or'] = [];
  query['$and'] = [];
  query.skip = ((+query.page) - 1) * (+query.limit);

  if (regexFields.length)
    for (const key of regexFields)
      if (query[key]) query[key] = { $regex: query[key], $options: 'i' };

  if (searchFields.length && query.search) {
    //! if search is a string and it contains any regex special character, then escape it
    if (typeof query.search === 'string' && isNaN(query.search))
      query.search = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
    for (const key of searchFields)
      if (
        !key.startsWith('+') ||
        (key.startsWith('+') && !isNaN(+query.search))
      )
        query['$or'].push({
          ...(key.startsWith('+')
            ? { [key.substring(1)]: +query.search }
            : { [key]: { $regex: query.search, $options: 'i' } }),
        });
    delete query.search;
  }


  if (rangeFields.length)
    for (const key of rangeFields)
      if (query[key]) {
        query['$and'].push({
          [key.split('Range')[0]]: {
            $gte: query[key][0],
            $lte: query[key][1],
          },
        });
        delete query[key];
      }


  if (inFields.length)
    for (const key of inFields) {
      if (query[key] && Array.isArray(query[key])) {
        query['$and'].push({ [key.split('__In__')[0]]: { $in: query[key] } });
      }
      delete query[key];
    }


  delete query.page;
  if (!query['$or'].length) delete query['$or'];
  if (!query['$and'].length) delete query['$and'];
  return query;
}

function checkFilterPermission({ 
  filtersNotAllowed = {
    [ROLE.ADMIN]: [],
    [ROLE.USER]: ['isActive', 'isAll'],
  },
  role = '',
  filtersApplied = {}, //! filters applied is the query/params/body object
} = {}) {
  if (!role) return {
    isSuccess: false,
    message: 'Role is required to check filter permission',
  }


  for (const _f_ in filtersApplied) {
    if (filtersNotAllowed[role].includes(_f_)) return {
        isSuccess: false,
        message: `'${_f_}' filter is not allowed for '${role}'`,
      }
  }
  
  return { isSuccess: true };
}

module.exports = {
  generateMatchFilter,
  checkFilterPermission,
};
