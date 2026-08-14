"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * Hero enxuto, com tipografia respirada. Sem painéis empilhados.
 * Diferencia do portfolio-genérico com uma única imagem nítida e uma assinatura
 * monoespaçada em vez de "olá, eu sou X".
 *
 * Animação de entrada: título palavra por palavra, foto com fade+scale.
 */
export default function Hero() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
      <div>
        <motion.p
          className="text-xs opacity-50 jetbrains-mono tracking-[0.2em] uppercase mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          UFRN · ECT · 2025
        </motion.p>
        <h1 className="jetbrains-mono font-bold leading-[1.05] tracking-tight text-4xl md:text-6xl">
          {"davi.".split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
            >
              {ch}
            </motion.span>
          ))}
          <br />
          <motion.span
            className="opacity-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            garoto
          </motion.span>{" "}
          <motion.span
            className="text-[color:var(--red)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            de
          </motion.span>{" "}
          <motion.span
            className="opacity-60"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            programa.
          </motion.span>
        </h1>
        <motion.p
          className="mt-6 max-w-prose opacity-80 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          sou garoto muito sonhador, amante da tecnologia, atualmente cursando o
          bacharelado interdisciplinar em ciência e tecnologia (BCT) da escola de
          ciência e tecnologia (ECT) da Universidade Federal do Rio Grande do
          Norte (UFRN)
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Image
          src="/images/jpg/eu.jpg"
          width={320}
          height={360}
          alt="davi"
          priority
          className="rounded-2xl box-ghost w-48 md:w-64 h-auto self-end md:self-center"
        />
      </motion.div>
    </section>
  );
}
