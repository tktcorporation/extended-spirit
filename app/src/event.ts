import axios from 'axios';

enum MenuId {
    GetOrgs,
    GetAuthToken,
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'parent',
        title: 'holaspirit',
    });
    chrome.contextMenus.create({
        id: MenuId.GetOrgs.toString(),
        parentId: 'parent',
        title: 'get orgs',
    });
    chrome.contextMenus.create({
        id: MenuId.GetAuthToken.toString(),
        parentId: 'parent',
        title: 'get auth token',
    });
});

// メニューをクリック時に実行
chrome.contextMenus.onClicked.addListener(async (item) => {
    console.log(item);
    console.log(item.menuItemId);
    try {
        switch (item.menuItemId) {
            case MenuId.GetOrgs.toString():
                alert(await getOrganizationsData());
            case MenuId.GetAuthToken.toString():
                await chrome.cookies.getAll(
                    { domain: 'app.holaspirit.com', name: 'holaAppToken' },
                    async (cookie) => {
                        console.log(`cccccc: ${cookie}`);
                        alert(await getAuthToken(cookie));
                    },
                );
        }
    } catch (error) {
        alert(error.message);
    }
});

const getOrganizationsData = async () => {
    const response = await axios.get(
        'https://app.holaspirit.com/api/public/organizations',
    );
    return JSON.stringify(response.data);
};

const getAuthToken = (AuthTokenCookie: chrome.cookies.Cookie[]) => {
    if (AuthTokenCookie.length < 1) {
        throw Error('認証トークンが見つかりませんでした');
    }
    const holaAppTokenEncoded = AuthTokenCookie[0].value;
    return JSON.parse(decodeURIComponent(holaAppTokenEncoded)).access_token;
};
