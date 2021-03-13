import axios from 'axios';

enum MenuId {
  GetOrgs,
  GetAccessToken,
  GetProject,
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
    id: MenuId.GetAccessToken.toString(),
    parentId: 'parent',
    title: 'get auth token',
  });
  chrome.contextMenus.create({
    id: MenuId.GetProject.toString(),
    parentId: 'parent',
    title: 'get project',
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
      case MenuId.GetAccessToken.toString():
        alert(await getAccessToken());
      case MenuId.GetProject.toString():
        const accessToken = await getAccessToken();
        alert(await getProject(accessToken, '6048054642d878641215a440'));
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

const getProject = async (
  accessToken: string,
  projectId: string,
  organizationId = '6048000e343b9430fb74ecf9',
) => {
  const client = axios.create({
    baseURL: 'https://app.holaspirit.com',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    responseType: 'json',
  });
  const response = await client.get(
    `/api/organizations/${organizationId}/projects/${projectId}`,
  );
  return JSON.stringify(response.data);
};

const getAccessToken = async (): Promise<string> => {
  const cookies = await new Promise<chrome.cookies.Cookie[]>((resolve) => {
    chrome.cookies.getAll(
      { domain: 'app.holaspirit.com', name: 'holaAppToken' },
      (cookie) => {
        resolve(cookie);
      },
    );
  });
  if (cookies.length < 1) {
    throw Error('認証トークンが見つかりませんでした');
  }
  const holaAppTokenEncoded = cookies[0].value;
  return JSON.parse(decodeURIComponent(holaAppTokenEncoded)).access_token;
};
