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
        "name": "第三弹·PVC海报一段·秋鸣星",
        "role": "秋鸣星",
        "type": "海报",
        "price": "25",
        "source": "网店",
        "remark": "网店常驻",
        "img": {
            "alt": "第三弹·PVC海报一段·秋鸣星.png",
            "src": "https://example.com/images/another_image.png"
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

document.addEventListener('DOMContentLoaded', () => {
    populateFilterOptions();
    populateTable();
});