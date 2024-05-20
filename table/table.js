let itemsList;
async function fetchAndParseXML() {
    try {
        const response = await fetch('../data/raw_items.xml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlText = await response.text();
        console.log(xmlText);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const itemsList = extractItems(xmlDoc);
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
    const itemsList = [];
	let img;
	let img_new;
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const value = name.getAttribute('value');
        const type = name.getElementsByTagName('type')[0]?.textContent || null;
        const img_full = name.getElementsByTagName('img')[0]?.textContent || null;
        const price = name.getElementsByTagName('price')[0].textContent || null;
		var index = img_full.indexOf('/150px');
		if (index !== -1) {
            img_new = img_full.slice(0, index);}
		else{
		    img_new = img_full
		}
		var indexThumb = img_new.indexOf('thumb');
        if (indexThumb !== -1) {
            img = img_new.slice(0, indexThumb) + img_new.slice(indexThumb + 5);
        }
		else{
			img = img_new;
		}
		itemsList.push({ value, type, price, img});
    }
    return itemsList;
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
                <td><img src="${item.img.src}" alt="${item.value}"></td>
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
