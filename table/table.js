let itemsList = [];

async function fetchAndParseXML() {
    try {
        const response = await fetch('../data/products.xml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlText = await response.text();
        console.log(xmlText);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        itemsList = extractItems(xmlDoc);
        console.log(itemsList);
        // 假设 extractItems 返回一个数组格式的数据
        populateTable(itemsList);
        populateFilterOptions(itemsList);
    } catch (error) {
        console.error('Error fetching and parsing XML:', error);
    }
}

// Function to extract items from parsed XML
function extractItems(xmlDoc) {
    const names = xmlDoc.getElementsByTagName('name');
    const itemsnewList = [];
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const value = name.getAttribute('value');
        const type = name.getElementsByTagName('type')[0]?.textContent || '';
        const img = name.getElementsByTagName('img')[0]?.textContent || '';
        const price = name.getElementsByTagName('price')[0]?.textContent || '';
        itemsnewList.push({ value, type, price, img });
    }
    return itemsnewList;
}

function populateTable(items) {
    const tableBody = document.getElementById('itemTableBody');
    tableBody.innerHTML = ''; // 清空表格内容

    const typeFilter = document.getElementById('typeFilter').value;

    items.forEach(item => {
        if (typeFilter === 'all' || item.type === typeFilter) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.value}</td>
                <td>${item.type}</td>
                <td>${item.price}</td>
                <td><img src="${item.img}" alt="${item.value}" width="50"></td>
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

function filterTable(){
    console.log(itemsList);
    populateTable(itemsList);
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
    const table = document.getElementById('itemTableBody');
    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
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
            tl: { col: 3, row: i + 1 },
            ext: { width: 100, height: 100 }
        });
    }

    // 保存工作簿
    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), 'goods_table.xlsx');
}
