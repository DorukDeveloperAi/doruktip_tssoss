# Hafif bir Nginx imajı kullanıyoruz
FROM nginx:alpine

# Nginx varsayılan HTML dizinine proje dosyalarını kopyalıyoruz
COPY . /usr/share/nginx/html

# 80 portunu açıyoruz
EXPOSE 80

# Nginx otomatik olarak başlar
