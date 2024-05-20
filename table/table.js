document.addEventListener('DOMContentLoaded', function() {
    populateFilterOptions();
    populateTable();

    // 确保元素存在并绑定事件
    const exportButton = document.getElementById('export');
    if (exportButton) {
        exportButton.addEventListener('click', async function() {
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
        });
    } else {
        console.error("Export button with ID 'export' not found.");
    }
});

const items = [
    {
        "name": "第二弹·PVC海报一段·夏鸣星",
        "role": "夏鸣星",
        "type": "海报",
        "price": "20",
        "source": "网店",
        "remark": "网店常驻",
        "img": {
            "alt": "第二弹·PVC海报一段·夏鸣星.png",
            "src": "https://patchwiki.biligame.com/images/qqlove/thumb/b/be/9uuf7e4mw7sl2jw4lnrksjt1k24x64w.png/150px-%E7%AC%AC%E4%BA%8C%E5%BC%B9%C2%B7PVC%E6%B5%B7%E6%8A%A5%E4%B8%80%E6%AE%B5%C2%B7%E5%A4%8F%E9%B8%A3%E6%98%9F.png.jpeg"
        }
    },
    {
        "name": "第二弹·PVC海报一段·夏鸣星",
        "role": "夏鸣星",
        "type": "吧唧",
        "price": "20",
        "source": "网店",
        "remark": "网店常驻",
        "img": {
            "alt": "第二弹·PVC海报一段·夏鸣星.png",
            "src": "https://patchwiki.biligame.com/images/qqlove/thumb/b/be/9uuf7e4mw7sl2jw4lnrksjt1k24x64w.png/150px-%E7%AC%AC%E4%BA%8C%E5%BC%B9%C2%B7PVC%E6%B5%B7%E6%8A%A5%E4%B8%80%E6%AE%B5%C2%B7%E5%A4%8F%E9%B8%A3%E6%98%9F.png.jpeg"
        }
    }
];

function populateTable() {
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

function populateFilterOptions() {
    const typeFilter = document.getElementById('typeFilter');
    const types = [...new Set(items.map(item => item.type))]; // 获取所有类型并去重
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });
}

function filterTable() {
    populateTable();
}
