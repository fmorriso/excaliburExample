import { ExcaliburExamplePage } from './app.po';

describe('excalibur-example App', () => {
  let page: ExcaliburExamplePage;

  beforeEach(() => {
    page = new ExcaliburExamplePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
