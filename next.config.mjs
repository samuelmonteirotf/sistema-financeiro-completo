/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript strict mode - não ignorar erros!
  // Se houver erros de build, eles devem ser corrigidos
  typescript: {
    ignoreBuildErrors: false,
  },
  // Nota: ESLint config agora deve ser configurado via .eslintrc ou package.json
  // Ver: https://nextjs.org/docs/app/api-reference/cli/next#next-lint-options
  images: {
    // unoptimized: true útil para desenvolvimento
    // Em produção, considere habilitar otimização de imagens
    unoptimized: true,
  },
}

export default nextConfig
