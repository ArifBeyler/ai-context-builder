# AI Context Builder - Next.js MVP

Next.js + Supabase + Stripe kullanan AI destekli context dosyası oluşturucu.

## Özellikler

- ✅ Supabase anonim auth ile giriş
- ✅ Kredi sistemi (başlangıçta 3 kredi)
- ✅ Context oluşturma işleminde kredi düşme
- ✅ Stripe Checkout ile ödeme (30 kredi = 29 TL)
- ✅ Webhook ile otomatik kredi güncelleme
- ✅ Kredi kontrolü ile dosya indirme
- ✅ Toast mesajları
- ✅ OpenAI GPT-3.5-turbo entegrasyonu

## ⚠️ Önce Node.js Yükleyin!

Terminalinizde `npm` komutu tanınmıyorsa, önce Node.js yüklemeniz gerekiyor:

1. **Node.js indirin:** https://nodejs.org (LTS version)
2. **Yükleyin** ve bilgisayarınızı yeniden başlatın
3. **Kontrol edin:** Terminal'de `node --version` ve `npm --version` yazın

## Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment variables ayarlayın:**
`env-variables-template.txt` dosyasını `.env.local` olarak kopyalayın ve doldurun:
```bash
# Windows'da:
copy env-variables-template.txt .env.local

# Mac/Linux'ta:
cp env-variables-template.txt .env.local
```

### Gerekli API Keys:

#### 🗄️ **Supabase** (Veritabanı + Auth)
- https://supabase.com → New project
- `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` alın
- SQL Editor'da users tablosunu oluşturun (aşağıda)

#### 💳 **Stripe** (Ödeme sistemi)
- https://stripe.com → Test mode API keys
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ve `STRIPE_SECRET_KEY` alın
- Webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

#### 🤖 **OpenAI** (AI özellikler)
- https://platform.openai.com → API Keys
- `NEXT_PUBLIC_OPENAI_API_KEY` alın (sk-proj- ile başlar)

3. **Supabase veritabanı kurulumu:**
Supabase SQL Editor'da aşağıdaki tabloyu oluşturun:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits INTEGER DEFAULT 3,
  anonymous_id TEXT
);

-- RLS politikaları
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

4. **Stripe webhook kurulumu:**
- Stripe Dashboard'da webhook endpoint ekleyin: `https://yourdomain.com/api/stripe/webhook`
- `checkout.session.completed` event'ini seçin
- Webhook secret'ı `.env.local`'e ekleyin

5. **Uygulamayı çalıştırın:**
```bash
npm run dev
```

## Kullanım

1. `/login` sayfasından anonim giriş yapın (3 ücretsiz kredi)
2. AI destekli context dosyası oluşturun (OpenAI GPT-3.5-turbo)
3. Kredi bittiğinde Stripe ile ödeme yapın (30 kredi)
4. Context dosyasını indirin

## API Endpoints

- `POST /api/stripe/checkout` - Ödeme session oluşturma
- `POST /api/stripe/webhook` - Stripe webhook

## Teknolojiler

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Anonymous)
- **Payment:** Stripe Checkout
- **UI:** Lucide React, React Hot Toast
- **AI:** OpenAI GPT-3.5-turbo

## Geliştirme Notları

- Middleware ile auth koruması
- Client-side ve server-side Supabase istemcileri
- TypeScript tip güvenliği
- Responsive tasarım
- Error handling ve loading states

## Sorun Giderme

### `npm` komutu tanınmıyor
```bash
# Node.js yükleyin: https://nodejs.org
# Bilgisayarı yeniden başlatın
# Kontrol edin:
node --version
npm --version
```

### API Key hataları
- OpenAI key'in `sk-proj-` ile başladığından emin olun
- Supabase URL'in `https://` ile başladığından emin olun
- `.env.local` dosyasının doğru konumda olduğundan emin olun

### Supabase bağlantı hataları
- RLS politikalarının doğru kurulduğundan emin olun
- Users tablosunun oluşturulduğundan emin olun
