// 应用数据存储
let nodes = [];
let itemLists = {};
let currentListName = '';

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    displayNodes();
    updateListSelector();
});

// ========== 节点管理功能 ==========

// 添加节点
function addNode() {
    const highLevel = document.getElementById('high-level').value;
    const lowLevel = document.getElementById('low-level').value;
    
    if (!highLevel || !lowLevel) {
        alert('请选择高级和低级属性！');
        return;
    }
    
    const node = {
        id: Date.now(),
        highLevel: highLevel,
        lowLevel: lowLevel,
        timestamp: new Date().toLocaleString()
    };
    
    nodes.push(node);
    displayNodes();
    saveData();
    
    // 清空选择
    document.getElementById('high-level').value = '';
    document.getElementById('low-level').value = '';
}

// 显示所有节点
function displayNodes() {
    const nodesList = document.getElementById('nodes-list');
    
    if (nodes.length === 0) {
        nodesList.innerHTML = '<div class="empty-state">暂无记录的节点</div>';
        return;
    }
    
    const nodesHTML = nodes.map(node => `
        <div class="node-item">
            <div class="node-info">
                <span class="node-attribute">高级: ${node.highLevel}</span>
                <span class="node-attribute">低级: ${node.lowLevel}</span>
                <span class="node-time">${node.timestamp}</span>
            </div>
            <button class="delete-node" onclick="deleteNode(${node.id})">删除</button>
        </div>
    `).join('');
    
    nodesList.innerHTML = nodesHTML;
}

// 删除节点
function deleteNode(nodeId) {
    if (confirm('确定要删除这个节点吗？')) {
        nodes = nodes.filter(node => node.id !== nodeId);
        displayNodes();
        saveData();
    }
}

// ========== 道具列表管理功能 ==========

// 创建新的道具列表
function createItemList() {
    const listName = document.getElementById('new-list-name').value.trim();
    
    if (!listName) {
        alert('请输入列表名称！');
        return;
    }
    
    if (itemLists[listName]) {
        alert('列表名称已存在！');
        return;
    }
    
    itemLists[listName] = [];
    currentListName = listName;
    
    updateListSelector();
    displayCurrentItems();
    saveData();
    
    document.getElementById('new-list-name').value = '';
}

// 更新列表选择器
function updateListSelector() {
    const selector = document.getElementById('current-list');
    const listNames = Object.keys(itemLists);
    
    selector.innerHTML = '<option value="">选择一个列表</option>';
    
    listNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if (name === currentListName) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

// 切换当前列表
function switchItemList() {
    const selector = document.getElementById('current-list');
    currentListName = selector.value;
    displayCurrentItems();
    saveData();
}

// 删除当前列表
function deleteCurrentList() {
    if (!currentListName) {
        alert('请先选择要删除的列表！');
        return;
    }
    
    if (confirm(`确定要删除列表 "${currentListName}" 吗？`)) {
        delete itemLists[currentListName];
        currentListName = '';
        updateListSelector();
        displayCurrentItems();
        saveData();
    }
}

// ========== 道具搜索功能 ==========

// 搜索道具
function searchItems() {
    const searchTerm = document.getElementById('item-search').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (!searchTerm) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    // 模糊匹配搜索
    const matchedItems = gameItems.filter(item => 
        item.toLowerCase().includes(searchTerm)
    );
    
    if (matchedItems.length === 0) {
        resultsContainer.innerHTML = '<div class="search-item">没有找到匹配的道具</div>';
        return;
    }
    
    // 限制显示结果数量，避免性能问题
    const displayItems = matchedItems.slice(0, 20);
    
    const resultsHTML = displayItems.map(item => `
        <div class="search-item" onclick="addItemToCurrentList('${item}')">
            ${item}
        </div>
    `).join('');
    
    resultsContainer.innerHTML = resultsHTML;
}

// 添加道具到当前列表
function addItemToCurrentList(itemName) {
    if (!currentListName) {
        alert('请先选择或创建一个列表！');
        return;
    }
    
    if (itemLists[currentListName].includes(itemName)) {
        alert('该道具已在列表中！');
        return;
    }
    
    itemLists[currentListName].push(itemName);
    displayCurrentItems();
    saveData();
    
    // 清空搜索
    document.getElementById('item-search').value = '';
    document.getElementById('search-results').innerHTML = '';
}

// 显示当前列表的道具
function displayCurrentItems() {
    const container = document.getElementById('current-items-list');
    
    if (!currentListName) {
        container.innerHTML = '<div class="empty-state">请选择一个列表</div>';
        return;
    }
    
    const items = itemLists[currentListName];
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state">列表中暂无道具</div>';
        return;
    }
    
    const itemsHTML = items.map(item => `
        <span class="item-tag">
            ${item}
            <button class="remove-item" onclick="removeItemFromCurrentList('${item}')">&times;</button>
        </span>
    `).join('');
    
    container.innerHTML = itemsHTML;
}

// 从当前列表移除道具
function removeItemFromCurrentList(itemName) {
    if (!currentListName) return;
    
    itemLists[currentListName] = itemLists[currentListName].filter(item => item !== itemName);
    displayCurrentItems();
    saveData();
}

// ========== 数据持久化 ==========

// 保存数据到本地存储
function saveData() {
    const data = {
        nodes: nodes,
        itemLists: itemLists,
        currentListName: currentListName
    };
    
    localStorage.setItem('rougeCountAssistData', JSON.stringify(data));
}

// 从本地存储加载数据
function loadData() {
    const savedData = localStorage.getItem('rougeCountAssistData');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            nodes = data.nodes || [];
            itemLists = data.itemLists || {};
            currentListName = data.currentListName || '';
        } catch (error) {
            console.error('加载数据时出错:', error);
            // 如果数据损坏，重置为默认值
            nodes = [];
            itemLists = {};
            currentListName = '';
        }
    }
}

// ========== 数据导出/导入功能 ==========

// 导出数据
function exportData() {
    const data = {
        nodes: nodes,
        itemLists: itemLists,
        exportTime: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `rouge-count-assist-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('导入数据将覆盖当前所有数据，确定继续吗？')) {
                nodes = data.nodes || [];
                itemLists = data.itemLists || {};
                currentListName = '';
                
                displayNodes();
                updateListSelector();
                displayCurrentItems();
                saveData();
                
                alert('数据导入成功！');
            }
        } catch (error) {
            alert('导入文件格式错误！');
            console.error('导入数据时出错:', error);
        }
    };
    
    reader.readAsText(file);
}

// 添加导出按钮到页面（可选）
document.addEventListener('DOMContentLoaded', function() {
    // 可以在这里添加导出/导入按钮的事件监听器
});
