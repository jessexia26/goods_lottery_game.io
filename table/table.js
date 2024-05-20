document.addEventListener('DOMContentLoaded', function() {
    populateFilterOptions();
    populateTable();

    // 确保元素存在并绑定事件
    const exportButton = document.getElementById('export');
    if (exportButton) {
        exportButton.addEventListener('click', async function() {
            // 获取表格
            const table = document.getElementById('goods');
            const workbook = XLSX.utils.table_to_book(table);

            // 遍历表格单元格以查找图像并添加到工作簿中
            const ws = workbook.Sheets[workbook.SheetNames[0]];
            const rows = table.rows;

            for (let i = 1; i < rows.length; i++) {  // 从1开始跳过表头
                const imgCell = rows[i].cells[3].getElementsByTagName('img')[0];
                if (imgCell) {
                    const imgSrc = imgCell.src;

                    // 使用fetch将图片转换为Base64
                    const blob = await fetch(imgSrc).then(res => res.blob());
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    await new Promise(resolve => reader.onloadend = resolve);
                    const base64data = reader.result;

                    // 插入图片到Excel单元格
                    const cell_ref = XLSX.utils.encode_cell({ c: 3, r: i });
                    if (!ws['!images']) ws['!images'] = [];
                    ws['!images'].push({
                        image: base64data,
                        type: 'image',
                        position: {
                            type: 'absoluteAnchor',
                            from: {
                                col: 3,
                                colOff: 0,
                                row: i,
                                rowOff: 0
                            },
                            to: {
                                col: 4,
                                colOff: 0,
                                row: i + 1,
                                rowOff: 0
                            }
                        }
                    });
                }
            }

            // 保存工作簿
            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'goods_table.xlsx');
        });
    } else {
        console.error("Export button with ID 'export' not found.");
    }
});

function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

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
