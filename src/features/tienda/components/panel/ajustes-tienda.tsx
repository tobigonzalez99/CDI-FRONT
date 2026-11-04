"use client";

import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Cargando, ErrorConsulta } from "@/components/shared/estado-consulta";
import { useTiposSocio } from "@/features/admin/hooks/use-socios";
import { useSession } from "@/features/auth/hooks/use-session";
import { Campo } from "@/features/tienda/components/panel/campo";
import {
  useActualizarConfiguracion,
  useActualizarDescuentoTienda,
  useConfiguracionAdmin,
} from "@/features/tienda/hooks/use-tienda-admin";
import { aplicarFieldErrors, mensajeDeError } from "@/lib/api/errors";
import {
  configuracionTiendaSchema,
  type ConfiguracionTiendaFormValues,
} from "@/lib/validators/tienda";
import type { TipoSocio } from "@/types/socio";
import type { ConfiguracionTienda } from "@/types/tienda";

function FormularioConfiguracion({ configuracion }: { configuracion: ConfiguracionTienda }) {
  const id = useId();
  const { mutateAsync: guardar } = useActualizarConfiguracion();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ConfiguracionTiendaFormValues>({
    resolver: zodResolver(configuracionTiendaSchema),
    values: {
      retiroLugar: configuracion.retiroLugar,
      retiroDireccion: configuracion.retiroDireccion,
      retiroHorarios: configuracion.retiroHorarios,
      umbralUltimasUnidades: configuracion.umbralUltimasUnidades,
    },
  });

  const onSubmit: SubmitHandler<ConfiguracionTiendaFormValues> = async (valores) => {
    try {
      await guardar(valores);
      reset(undefined, { keepValues: true });
      toast.success("Ajustes guardados");
    } catch (error) {
      if (
        !aplicarFieldErrors(error, setError, [
          "retiroLugar",
          "retiroDireccion",
          "retiroHorarios",
          "umbralUltimasUnidades",
        ])
      ) {
        toast.error("No pudimos guardar los ajustes", { description: mensajeDeError(error) });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Retiro en el club</CardTitle>
          <CardDescription>
            Aparece en la ficha, el carrito, la compra y los correos. Mientras esté vacío, la
            tienda dice solo «Retiro en el club».
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Campo id={`${id}-lugar`} etiqueta="Lugar" error={errors.retiroLugar?.message}>
            <Input id={`${id}-lugar`} placeholder="Por ejemplo: la sede social" className="h-10" {...register("retiroLugar")} />
          </Campo>
          <Campo id={`${id}-dir`} etiqueta="Dirección" error={errors.retiroDireccion?.message}>
            <Input id={`${id}-dir`} className="h-10" {...register("retiroDireccion")} />
          </Campo>
          <Campo id={`${id}-hor`} etiqueta="Horarios" error={errors.retiroHorarios?.message}>
            <Input id={`${id}-hor`} placeholder="Por ejemplo: lunes a viernes de 17 a 21 h" className="h-10" {...register("retiroHorarios")} />
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-base">Aviso de últimas unidades</CardTitle>
          <CardDescription>
            Con este stock o menos, la tienda muestra «Últimas unidades». El número exacto no
            se muestra nunca.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Campo id={`${id}-umbral`} etiqueta="Unidades" error={errors.umbralUltimasUnidades?.message}>
            <Input
              id={`${id}-umbral`}
              type="number"
              min={0}
              inputMode="numeric"
              className="h-10 w-28"
              {...register("umbralUltimasUnidades", { valueAsNumber: true })}
            />
          </Campo>
        </CardContent>
      </Card>

      <div className="flex justify-end lg:col-span-2">
        <Button type="submit" size="lg" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden />}
          Guardar ajustes
        </Button>
      </div>
    </form>
  );
}

function FilaDescuento({ tipo }: { tipo: TipoSocio }) {
  const [valor, setValor] = useState(String(tipo.descuentoTienda));
  const { mutateAsync: guardar, isPending } = useActualizarDescuentoTienda();
  const numero = Number(valor);
  const valido = valor.trim() !== "" && Number.isFinite(numero) && numero >= 0 && numero <= 100;

  async function alGuardar(evento: React.FormEvent) {
    evento.preventDefault();
    try {
      await guardar({ id: tipo.id, descuentoTienda: numero });
      toast.success(
        numero === 0 ? `${tipo.nombre}: sin descuento` : `${tipo.nombre}: ${numero}% de descuento`,
      );
    } catch (error) {
      toast.error("No pudimos guardar el descuento", { description: mensajeDeError(error) });
    }
  }

  return (
    <form onSubmit={(evento) => void alGuardar(evento)} className="flex items-center justify-between gap-4 py-2">
      <label htmlFor={`desc-${tipo.id}`} className="text-sm font-medium">
        {tipo.nombre}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id={`desc-${tipo.id}`}
          type="number"
          min={0}
          max={100}
          inputMode="numeric"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          className="h-9 w-20 text-right"
          aria-invalid={!valido}
        />
        <span className="text-sm text-muted-foreground">%</span>
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!valido || isPending || numero === tipo.descuentoTienda}
        >
          Guardar
        </Button>
      </div>
    </form>
  );
}

/** Solo el administrador: el operador de la tienda no ve nada de socios. */
function DescuentosDeSocio() {
  const { data, isPending, isError, error, refetch } = useTiposSocio();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-base">Descuento de socio</CardTitle>
        <CardDescription>
          Por categoría de socio. Vale para quien está de alta y con la cuota al día. Con 0 %
          esa categoría no tiene descuento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <Cargando etiqueta="Cargando las categorías de socio…" />
        ) : isError ? (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} />
        ) : (
          <div className="divide-y">
            {data.map((tipo) => (
              <FilaDescuento key={tipo.id} tipo={tipo} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AjustesTienda() {
  const { user } = useSession();
  const { data, isPending, isError, error, refetch } = useConfiguracionAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Ajustes de la tienda</h1>
        <p className="text-sm text-muted-foreground">Cambian lo que ve el comprador en toda la tienda.</p>
      </div>

      {isPending ? (
        <Cargando etiqueta="Cargando los ajustes…" />
      ) : isError ? (
        <ErrorConsulta error={error} onReintentar={() => void refetch()} />
      ) : (
        <FormularioConfiguracion configuracion={data} />
      )}

      {user?.rol === "ADMIN" && (
        <div className="max-w-xl">
          <DescuentosDeSocio />
        </div>
      )}
    </div>
  );
}
