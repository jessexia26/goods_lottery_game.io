async function fetchAndParseXML() {
    try {
        const response = await fetch('../data/raw_data.xml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlText = await response.text();
        console.log(xmlText);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const itemsList = extractItems(xmlDoc);

        // 假设 extractItems 返回一个数组格式的数据
        populateTable(itemsList);
        populateFilterOptions(itemsList);
    } catch (error) {
        console.error('Error fetching and parsing XML:', error);
    }
}

function extractItems(xmlDoc) {
    const items = [];
    const itemElements = xmlDoc.getElementsByTagName('item');
    for (let itemElement of itemElements) {
        const name = itemElement.getElementsByTagName('name')[0].textContent;
        const type = itemElement.getElementsByTagName('type')[0].textContent;
        const price = itemElement.getElementsByTagName('price')[0].textContent;
        const imgSrc = itemElement.getElementsByTagName('img')[0].getAttribute('src');
        const imgAlt = itemElement.getElementsByTagName('img')[0].getAttribute('alt');

        items.push({
            name,
            type,
            price,
            img: {
                src: imgSrc,
                alt: imgAlt
            }
        });
    }
    return items;
}

function populateTable(items) {
    const tableBody = document.getElementById('itemTableBody');
    tableBody.innerHTML = ''; // 清空表格内容

    const typeFilter = document.getElementById('typeFilter').value;

    items.forEach(item => {
        if (typeFilter === 'all' || item.type === typeFilter) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${item.price}</td>
                <td><img src="${item.img.src}" alt="${item.img.alt}"></td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function populateFilterOptions(items) {
    const typeFilter = document.getElementById('typeFilter');
    typeFilter.innerHTML = '<option value="all">所有</option>'; // 先清空选项
    const types = [...new Set(items.map(item => item.type))]; // 获取所有类型并去重
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

function filterTable() {
    const items = extractItemsFromCurrentState(); // 假设你有一个函数可以从当前状态中提取 items
    populateTable(items);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndParseXML();
    document.getElementById('typeFilter').addEventListener('change', filterTable);
    document.getElementById('export').addEventListener('click', exportTable);
});

async function exportTable() {
    const { ExcelJS } = window;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Goods');

    // 添加表头
    worksheet.columns = [
        { header: '名字', key: 'name', width: 30 },
        { header: '类型', key: 'type', width: 15 },
        { header: '价格', key: 'price', width: 10 },
        { header: '图片', key: 'img', width: 30 }
    ];

    // 遍历表格行
    const table = document.getElementById('goods');
    const rows = table.rows;

    for (let i = 1; i < rows.length; i++) {  // 从1开始跳过表头
        const name = rows[i].cells[0].innerText;
        const type = rows[i].cells[1].innerText;
        const price = rows[i].cells[2].innerText;
        const img = rows[i].cells[3].getElementsByTagName('img')[0];
        const imgSrc = img.src;

        const row = worksheet.addRow({ name, type, price });

        // 插入图片到Excel单元格
        const response = await fetch(imgSrc);
        const buffer = await response.arrayBuffer();
        const imageId = workbook.addImage({
            buffer,
            extension: 'png',
        });

        worksheet.addImage(imageId, {
            tl: { col: 3, row: i },  // top-left corner
            ext: { width: 100, height: 100 }  // extent (size)
        });
    }

    // 保存工作簿
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'goods_table.xlsx');
}
