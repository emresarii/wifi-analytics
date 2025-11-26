# Node.js imajı kullanıyoruz (Hafif sürüm: alpine)
FROM node:22-alpine

# Çalışma dizini
WORKDIR /app

# Paket listelerini kopyala (Cache optimizasyonu için önce bunları alıyoruz)
COPY package.json package-lock.json ./

# Modülleri yükle
RUN npm install

# Geri kalan tüm frontend kodlarını kopyala
COPY . .

# Vite varsayılan portu
EXPOSE 5173

# Uygulamayı başlat (--host parametresi Docker dışından erişim için şart)
CMD ["npm", "run", "dev", "--", "--host"]