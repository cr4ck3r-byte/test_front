import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Checkbox } from "./components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { formatPrice } from "./utils/formatCurrency";

const API_URL = "http://localhost:3000/api";

export default function CrudHotel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("persona");
  const [personas, setPersonas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);

  const [persona, setPersona] = useState({
    nombre_completo: "",
    nr_documento: "",
    correo: "",
    telefono: "",
  });

  const [habitacion, setHabitacion] = useState({
    habitacion_piso: "",
    habitacion_nro: "",
    cant_camas: "",
    tiene_television: false,
    tiene_frigobar: false,
  });

  const [reserva, setReserva] = useState({
    fecha_entrada: "",
    fecha_salida: "",
    habitacion_id: "",
    persona_id: "",
    monto_reserva: "",
    id: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [personasRes, habitacionesRes, reservasRes] = await Promise.all([
        axios.get(`${API_URL}/persona`),
        axios.get(`${API_URL}/habitacion`),
        axios.get(`${API_URL}/reserva`),
      ]);
      setPersonas(personasRes.data.respuesta);
      setHabitaciones(habitacionesRes.data.respuesta);
      setReservas(reservasRes.data.respuesta);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos",
      });
    }
  };

  const getHabitacionesDisponibles = (
    fecha_Entrada,
    fecha_Salida,
    habitacionIdActu_al = null
  ) => {
    return habitaciones?.filter((habitacion) => {
      const habitacionReservas = reservas.filter(
        (r) => r.habitacion_id === habitacion.id && r.id !== habitacionIdActu_al
      );

      return !habitacionReservas.some((r) => {
        const reservaEntrada = new Date(r.fecha_entrada);
        const reservaSalida = new Date(r.fecha_salida);
        const nuevaEntrada = new Date(fecha_Entrada);
        const nuevaSalida = new Date(fecha_Salida);

        return (
          (nuevaEntrada >= reservaEntrada && nuevaEntrada < reservaSalida) ||
          (nuevaSalida > reservaEntrada && nuevaSalida <= reservaSalida) ||
          (nuevaEntrada <= reservaEntrada && nuevaSalida >= reservaSalida)
        );
      });
    });
  };

  const resetForm = () => {
    if (activeTab === "persona") {
      setPersona({
        nombre_completo: "",
        nr_documento: "",
        correo: "",
        telefono: "",
      });
    } else if (activeTab === "habitacion") {
      setHabitacion({
        habitacion_piso: "",
        habitacion_nro: "",
        cant_camas: "",
        tiene_television: false,
        tiene_frigobar: false,
      });
    } else if (activeTab === "reserva") {
      setReserva({
        fecha_entrada: "",
        fecha_salida: "",
        habitacion_id: "",
        persona_id: "",
        monto_reserva: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "persona") {
        if (persona.id) {
          await axios.put(`${API_URL}/persona/${persona.id}`, persona);
        } else {
          await axios.post(`${API_URL}/persona`, persona);
        }
      } else if (activeTab === "habitacion") {
        if (habitacion.id) {
          await axios.put(`${API_URL}/habitacion/${habitacion.id}`, habitacion);
        } else {
          await axios.post(`${API_URL}/habitacion`, habitacion);
        }
      } else if (activeTab === "reserva") {
        const reservaData = {
          ...reserva,
          fecha_reserva: new Date().toISOString(),
          habitacion_id: Number(reserva.habitacion_id),
          persona_id: Number(reserva.persona_id),
        };
        if (reserva.id) {
          await axios.put(`${API_URL}/reserva/${reserva.id}`, {
            ...reservaData,
          });
        } else {
          await axios.post(`${API_URL}/reserva`, reservaData);
        }
      }
      await loadData();
      resetForm();
      toast({
        title: "Éxito",
        description: "Operación realizada correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Error al procesar la operación",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === "persona") {
        await axios.delete(`${API_URL}/persona/${id}`);
      } else if (activeTab === "habitacion") {
        await axios.delete(`${API_URL}/habitacion/${id}`);
      } else if (activeTab === "reserva") {
        await axios.delete(`${API_URL}/reserva/${id}`);
      }
      await loadData();
      toast({
        title: "Éxito",
        description: "Elemento eliminado correctamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar el elemento",
      });
    }
  };

  const validateForm = () => {
    if (activeTab === "persona") {
      return (
        persona.nombre_completo &&
        persona.nr_documento &&
        persona.correo &&
        persona.telefono
      );
    } else if (activeTab === "habitacion") {
      return (
        habitacion.habitacion_piso &&
        habitacion.habitacion_nro &&
        habitacion.cant_camas &&
        Number(habitacion.habitacion_piso) > 0 &&
        Number(habitacion.habitacion_piso) <= 10 &&
        Number(habitacion.habitacion_nro) > 0 &&
        Number(habitacion.habitacion_nro) <= 20 &&
        Number(habitacion.cant_camas) >= 1 &&
        Number(habitacion.cant_camas) <= 4
      );
    } else if (activeTab === "reserva") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entrada = new Date(reserva.fecha_entrada);
      const salida = new Date(reserva.fecha_salida);
      return (
        reserva.fecha_entrada &&
        reserva.fecha_salida &&
        reserva.habitacion_id &&
        reserva.persona_id &&
        entrada > today &&
        salida > entrada
      );
    }
    return false;
  };

  useEffect(() => {
    if (
      activeTab === "reserva" &&
      reserva.fecha_entrada &&
      reserva.fecha_salida
    ) {
      const entrada = new Date(reserva.fecha_entrada);
      const salida = new Date(reserva.fecha_salida);
      const dias = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      setReserva((prev) => ({
        ...prev,
        monto_reserva: formatPrice((dias * 120000).toString()),
      }));
    }
  }, [reserva.fecha_entrada, reserva.fecha_salida, activeTab]);

  const handleEdit = (item) => {
    if (activeTab === "persona") setPersona(item);
    if (activeTab === "habitacion")
      setHabitacion(() => {
        let tiene_frigobar = item.tiene_frigobar ? true : false;
        let tiene_television = item.tiene_television ? true : false;
        return {
          ...item,
          tiene_frigobar,
          tiene_television,
        };
      });
    if (activeTab === "reserva") {
      const editedReserva = {
        fecha_entrada: item.fecha_entrada
          ? item.fecha_entrada.split("T")[0]
          : "",
        fecha_salida: item.fecha_salida ? item.fecha_salida.split("T")[0] : "",
        persona_id: item.persona_id.toString(),
      };
      setReserva(editedReserva);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="habitacion">Habitación</TabsTrigger>
          <TabsTrigger value="reserva">Reserva</TabsTrigger>
        </TabsList>
        <TabsContent value="persona">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Personas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_completo">Nombre Completo</Label>
                    <Input
                      id="nombre_completo"
                      value={persona.nombre_completo}
                      onChange={(e) =>
                        setPersona({
                          ...persona,
                          nombre_completo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nr_documento">Nro. Documento</Label>
                    <Input
                      id="nr_documento"
                      value={persona.nr_documento}
                      onChange={(e) =>
                        setPersona({
                          ...persona,
                          nr_documento: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correo">Correo</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={persona.correo}
                      onChange={(e) =>
                        setPersona({ ...persona, correo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={persona.telefono}
                      onChange={(e) =>
                        setPersona({ ...persona, telefono: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="submit" disabled={!validateForm()}>
                  Guardar
                </Button>
              </form>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personas.length > 0
                ? personas?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nombre_completo}</TableCell>
                      <TableCell>{p.nr_documento}</TableCell>
                      <TableCell>{p.correo}</TableCell>
                      <TableCell>{p.telefono}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(p)} className="mr-2">
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(p.id)}
                          variant="destructive"
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="habitacion">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Habitaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="habitacion_piso">Piso (1-10)</Label>
                    <Input
                      id="habitacion_piso"
                      type="number"
                      min="1"
                      max="10"
                      value={habitacion.habitacion_piso}
                      onChange={(e) =>
                        setHabitacion({
                          ...habitacion,
                          habitacion_piso: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="habitacion_nro">Número (1-20)</Label>
                    <Input
                      id="habitacion_nro"
                      type="number"
                      min="1"
                      max="20"
                      value={habitacion.habitacion_nro}
                      onChange={(e) =>
                        setHabitacion({
                          ...habitacion,
                          habitacion_nro: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cant_camas">Cantidad de Camas (1-4)</Label>
                    <Input
                      id="cant_camas"
                      type="number"
                      min="1"
                      max="4"
                      value={habitacion.cant_camas}
                      onChange={(e) =>
                        setHabitacion({
                          ...habitacion,
                          cant_camas: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiene_television"
                        checked={habitacion.tiene_television}
                        onCheckedChange={(checked) =>
                          setHabitacion({
                            ...habitacion,
                            tiene_television: checked,
                          })
                        }
                      />
                      <Label htmlFor="tiene_television">Tiene Televisión</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiene_frigobar"
                        checked={habitacion.tiene_frigobar}
                        onCheckedChange={(checked) =>
                          setHabitacion({
                            ...habitacion,
                            tiene_frigobar: checked,
                          })
                        }
                      />
                      <Label htmlFor="tiene_frigobar">Tiene Frigobar</Label>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={!validateForm()}>
                  Guardar
                </Button>
              </form>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Piso</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Camas</TableHead>
                <TableHead>TV</TableHead>
                <TableHead>Frigobar</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {habitaciones.length > 0
                ? habitaciones.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell>{h.habitacion_piso}</TableCell>
                      <TableCell>{h.habitacion_nro}</TableCell>
                      <TableCell>{h.cant_camas}</TableCell>
                      <TableCell>{h.tiene_television ? "Sí" : "No"}</TableCell>
                      <TableCell>{h.tiene_frigobar ? "Sí" : "No"}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(h)} className="mr-2">
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(h.id)}
                          variant="destructive"
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="reserva">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Reservas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_entrada">Fecha de Entrada</Label>
                    {console.log(reserva)}
                    <Input
                      id="fecha_entrada"
                      type="date"
                      value={reserva.fecha_entrada}
                      onChange={(e) =>
                        setReserva({
                          ...reserva,
                          fecha_entrada: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_salida">Fecha de Salida</Label>
                    <Input
                      id="fecha_salida"
                      type="date"
                      value={reserva.fecha_salida}
                      onChange={(e) =>
                        setReserva({ ...reserva, fecha_salida: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="habitacion_id">Habitación</Label>
                    <Select
                      value={reserva.habitacion_id}
                      onValueChange={(value) =>
                        setReserva({ ...reserva, habitacion_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una habitación" />
                      </SelectTrigger>
                      <SelectContent>
                        {habitaciones.length > 0
                          ? getHabitacionesDisponibles(
                              reserva.fecha_entrada,
                              reserva.fecha_salida,
                              reserva.id
                            ).map((h) => (
                              <SelectItem key={h.id} value={h.id.toString()}>
                                Piso {h.habitacion_piso}, Nro {h.habitacion_nro}
                              </SelectItem>
                            ))
                          : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="persona_id">Persona</Label>
                    <Select
                      value={reserva.persona_id}
                      onValueChange={(value) =>
                        setReserva({ ...reserva, persona_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una persona" />
                      </SelectTrigger>
                      <SelectContent>
                        {personas.length > 0
                          ? personas.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.nombre_completo}
                              </SelectItem>
                            ))
                          : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto_reserva">
                      Monto de Reserva (Gs.)
                    </Label>
                    <Input
                      id="monto_reserva"
                      value={reserva.monto_reserva}
                      readOnly
                    />
                  </div>
                </div>
                <Button type="submit" disabled={!validateForm()}>
                  Guardar
                </Button>
              </form>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Reserva</TableHead>
                <TableHead>Fecha Entrada</TableHead>
                <TableHead>Fecha Salida</TableHead>
                <TableHead>Habitación</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Monto (Gs.)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.length > 0
                ? reservas.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {new Date(r.fecha_reserva).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(r.fecha_entrada).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(r.fecha_salida).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {habitaciones.find((h) => h.id === r.habitacion_id)
                          ?.habitacion_nro || "N/A"}
                      </TableCell>
                      <TableCell>
                        {personas.find((p) => p.id === r.persona_id)
                          ?.nombre_completo || "N/A"}
                      </TableCell>
                      <TableCell>
                        {Number(r.monto_reserva).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(r)} className="mr-2">
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(r.id)}
                          variant="destructive"
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
