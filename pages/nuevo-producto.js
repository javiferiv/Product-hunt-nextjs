import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from './../components/layout/Layouts';
import { Formulario, Campo, InputSubmit, Error } from './../components/ui/Formulario';

import { FirebaseContext } from '../firebase/index';

//Validaciones
import useValidacion from './../hooks/useValidacion';
import validarCrearProducto from './../validacion/validarCrearProducto';

const STATE_INICIAL = {
    nombre:'',
    empresa: '',
    imagen: '',
    url: '',
    descripcion:''
}

export default function NuevoProducto() {

    const [error, guardarError] = useState(false);
    const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);
    const { nombre, empresa, imagen, url, descripcion } = valores;

    //State de las imagenes
    const [nombreimagen, guardarNombre] = useState('');
    const [subiendo, guardarSubiendo] = useState(false);
    const [progreso, guardarProgreso] = useState(0);
    const [urlimagen, guardarUrlImagen] = useState('');

    //Hook de routing para redireccionar
    const router = useRouter();

    //Context con las operaciones CRUD de Firebase
    const { usuario, firebase } = useContext(FirebaseContext);

    async function crearProducto() {
      //Si el usuario no está autenticado
        if(!usuario){
            return router.push('/login');
        }

      //Crear el objeto de nuevo producto
        const producto = {
            nombre,
            empresa,
            url,
            urlimagen,
            descripcion,
            votos: 0,
            comentarios: [],
            creado: Date.now()
        }

        //Insertarlo en la Base de Datos
        firebase.db.collection('productos').add(producto);
        return router.push('/');
    };

    const handleUploadStart = () => {
        guardarProgreso(0);
        guardarSubiendo(true);
    };

    const handleProgress = progreso => guardarProgreso({ progreso });

    const handleUploadError = error => {
        guardarSubiendo(error);
        console.error(error)
    };

    const handleUploadSuccess = nombre => {
        guardarProgreso(100);
        guardarSubiendo(false);
        guardarNombre(nombre)
        firebase
            .storage
            .ref("productos")
            .child(nombre)
            .getDownloadURL()
            .then(url => { 
                console.log(url);
                guardarUrlImagen(url);
            });
    }

    return (
        <div>
            <Layout>
                <>
                    <h1 css={css`text-align: center; margin-top: 5rem;`}>Nuevo Producto</h1>
                    <Formulario
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <fieldset>
                            
                            <legend>Información General</legend>

                            <Campo>
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    placeholder="Tu nombre"
                                    name="nombre"
                                    value={nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>
                            {errores.nombre && <Error>{errores.nombre}</Error>}

                            <Campo>
                                <label htmlFor="empresa">Empresa</label>
                                <input
                                    type="text"
                                    id="empresa"
                                    placeholder="Nombre Empresa o Compañía"
                                    name="empresa"
                                    value={empresa}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>
                            {errores.empresa && <Error>{errores.empresa}</Error>}

                            <Campo>
                                <label htmlFor="imagen">Imagen</label>
                                <FileUploader
                                    accept="image/*"
                                    id="imagen"
                                    name="imagen"
                                    randomizeFilename
                                    storageRef={firebase.storage.ref("productos")}
                                    onUploadStart={handleUploadStart}
                                    onUploadError={handleUploadError}
                                    onUploadSuccess={handleUploadSuccess}
                                    onProgress={handleProgress}
                                />
                            </Campo>                        

                            <Campo>
                                <label htmlFor="url">URL</label>
                                <input
                                    type="url"
                                    id="url"
                                    name="url"
                                    placeholder="URL de tu producto"
                                    value={url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>

                            {errores.url && <Error>{errores.url}</Error>}
                        </fieldset>

                        <fieldset>
                            
                            <legend>Sobre tu Producto</legend>
                      
                            <Campo>
                                <label htmlFor="descripcion">Descripción</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>
                            {errores.descripcion && <Error>{errores.descripcion}</Error>}

                        </fieldset>

                        <InputSubmit
                            type="submit"
                            value="Crear Producto"
                        />
                    </Formulario>
                </>
            </Layout>
        </div>
    )
}
