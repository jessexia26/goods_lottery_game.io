const response = await fetch('../data/raw_data.xml');
if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
const xmlText = await response.text();
console.log(xmlText);
const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
const items = extractItems(xmlDoc);

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

document.addEventListener('DOMContentLoaded', () => {
    populateFilterOptions();
    populateTable();
});


document.getElementById('export').addEventListener('click', function() {
    // 获取表格
    var table = document.getElementById('goods');
    var workbook = XLSX.utils.table_to_book(table);

    // 遍历表格单元格以查找图像并添加到工作簿中
    var ws = workbook.Sheets[workbook.SheetNames[0]];
    var rows = table.rows;

    for (var i = 1; i < rows.length; i++) {  // 从1开始跳过表头
        var imgCell = rows[i].cells[3].getElementsByTagName('img')[0];
        if (imgCell) {
            var imgSrc = imgCell.src;

            // 使用fetch将图片转换为Base64
            fetch(imgSrc)
                .then(res => res.blob())
                .then(blob => {
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function() {
                        var base64data = reader.result;

                        // 插入图片到Excel单元格
                        var cell_ref = XLSX.utils.encode_cell({c: 3, r: i});
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

                        if (i === rows.length - 1) {
                            // 保存工作簿
                            var wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
                            saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'goods_table.xlsx');
                        }
                    };
                });
        }
    }
});

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}