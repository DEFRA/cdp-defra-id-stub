function transformLoa(loa) {
  return [
    {
      value: '0',
      text: 'LOA0',
      checked: loa === '0'
    },
    {
      value: '1',
      text: 'LOA1',
      checked: loa !== '0' && loa !== '2'
    },
    {
      value: '2',
      text: 'LOA2',
      checked: loa === '2'
    }
  ]
}

function transformAal(aal) {
  return [
    {
      value: '1',
      text: 'No',
      checked: aal !== '2'
    },
    {
      value: '2',
      text: 'Yes',
      checked: aal === '2'
    }
  ]
}

export { transformLoa, transformAal }
