# 小婷智能辅助 - 工具下载站

一个纯静态的工具下载网站，不需要服务器和数据库，双击 `index.html` 即可在浏览器中预览。

## 目录结构

```
├── index.html          首页（工具列表 + 搜索 + 分类筛选）
├── tool.html           工具详情页（通过 ?id=工具id 显示对应工具）
├── guide.html          使用帮助（杀毒误报、SmartScreen 等常见问题）
├── about.html          关于页面（记得把里面的邮箱换成自己的）
├── data/
│   └── tools.js        ★ 工具数据文件 —— 日常维护只需要改这一个文件
└── assets/
    ├── css/style.css   全站样式
    └── js/main.js      页面渲染逻辑
```

## 如何发布一个新工具

1. 打包好工具（exe/zip），推荐上传到 GitHub Releases 获得下载直链
2. 在 PowerShell 中运行 `Get-FileHash 文件名.exe` 获取 SHA256 校验值
3. 打开 `data/tools.js`，照着示例在 `TOOLS` 数组里加一条记录（字段说明见文件开头注释）
4. 保存后刷新网页即可看到新工具；如已部署上线，重新发布一次即可

## 如何部署上线（推荐 Cloudflare Pages，免费）

1. 注册 GitHub 账号，把本目录建成一个仓库并推送上去
2. 注册 Cloudflare 账号 → Workers & Pages → 创建 Pages 项目 → 连接该 GitHub 仓库
3. 构建设置全部留空（纯静态站点，无需构建命令），点击部署
4. 部署完成后获得 `xxx.pages.dev` 网址；以后每次 push 代码会自动重新部署
5. （可选）购买自己的域名并在 Cloudflare 中绑定

## 工具安装包存放建议

- **GitHub Releases**（推荐起步方案）：免费、单文件最大 2GB、自带版本管理
- 用户量大了以后可迁移到阿里云 OSS / 腾讯云 COS + CDN，国内下载更快
