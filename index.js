const puppeteer = require("puppeteer");

(async () => {
  const URL = "https://listado.mercadolibre.com.ar/medias-para-programadores#D[A:medias%20para%20programadores%20]";
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: "networkidle2" });
  const title = await page.title();
  console.log(`Titulo de la pagina: ${title}`);

  let nextPage = true;
  let products = [];

  while (nextPage) {
    try {
      await page.waitForSelector('.ui-search-result__wrapper', { timeout: 10000 });
      const newProducts = await page.evaluate(() => {
        const productElements = Array.from(document.querySelectorAll('.ui-search-result__wrapper'));
        return productElements.map(product => {
          const titleElement = product.querySelector('.ui-search-item__title');
          return titleElement ? titleElement.innerText : null;
        }).filter(title => title !== null);
      });

      products = [...products, ...newProducts];
      console.log(newProducts);

      const nextButton = await page.$('li.andes-pagination__button--next a');
      if (nextButton) {
        await page.evaluate(el => el.scrollIntoView(), nextButton); // Ensure the button is in view
        await page.waitForTimeout(1000); // Adding delay to handle potential loading issues
        await Promise.all([
          nextButton.click(),
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);
      } else {
        nextPage = false;
      }
    } catch (error) {
      console.error('Error:', error);
      nextPage = false;
    }
  }

  console.log(products);
  await browser.close();
})();
