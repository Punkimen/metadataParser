const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');
const Sitemapper = require('sitemapper');
const sitemap = new Sitemapper();
const cheerio = require('cheerio');

function extractLinks(xmlString) {
  const links = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;

  while ((match = regex.exec(xmlString)) !== null) {
    links.push(match[1]);
  }

  return links;
}

const parseSite = async () => {
  const metadataArr = [];
  // const xmlData = fs.readFileSync('C:/Users/punki/Downloads/6087689_148.xml', 'utf-8');
  // const urls = extractLinks(xmlData)
  const urls = await sitemap.fetch('https://lofthall.ru/sitemap.xml')

  async function fetchMetaData(url) {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content');

      return {
        url,
        title,
        description
      };
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  }

  for (let url of urls.sites) {
    const metadata = await fetchMetaData(url);
    if (metadata) {
      metadataArr.push(metadata);
    }
  }

  return metadataArr
}

function generateExcelFile(data, fileName) {
  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'MetaData');

  XLSX.writeFile(workbook, fileName);
}

parseSite().then(data => {
  console.log(data)
  generateExcelFile(data, 'meta_data_2.xlsx');
})

