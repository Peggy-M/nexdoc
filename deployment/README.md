## 常见问题

- **502 Bad Gateway**: 
  - 检查后端是否运行: `sudo systemctl status nexdoc-backend`
  - 查看后端报错日志: `sudo journalctl -u nexdoc-backend -n 50`

- **Nginx 欢迎页面 (Welcome to nginx)**:
  - 可能是默认配置未清除。运行: `sudo rm /etc/nginx/conf.d/default.conf` 然后 `sudo systemctl reload nginx`

- **Python 版本错误**:
  - 脚本会在 CentOS 8 上自动安装 Python 3.9。如果失败，请手动安装 Python 3.8+ 并确保 `python3` 命令指向它。

## SSL 证书配置 (HTTPS)

我们提供了一个脚本来自动化配置 SSL 证书（使用 Certbot/Let's Encrypt）。

**前提条件**:
1. 你必须拥有一个域名（例如 `nexdoc.example.com`）。
2. 将该域名的 A 记录解析到你的服务器 IP。

**配置步骤**:
1. 运行 SSL 配置脚本：
   ```bash
   sudo chmod +x deployment/setup_ssl.sh
   sudo ./deployment/setup_ssl.sh
   ```
2. 按提示输入你的域名。
3. 脚本会自动申请证书并更新 Nginx 配置。

**手动配置 SSL**:
如果自动化脚本失败，或者你有自己的证书文件：
1. 将证书文件上传到服务器。
2. 编辑 `/etc/nginx/conf.d/nexdoc.conf` (CentOS) 或 `/etc/nginx/sites-available/nexdoc` (Ubuntu)。
3. 添加 `listen 443 ssl;` 及证书路径配置。
4. 重启 Nginx: `sudo systemctl reload nginx`。
