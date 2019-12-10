exports.onCreatePage = ({page, actions}) => {
  const {createPage} = actions;

  if (/^\/dashboard\//.test(page.path)) {
    page.context.layout = 'dashboard';
    createPage(page);
  }
};
