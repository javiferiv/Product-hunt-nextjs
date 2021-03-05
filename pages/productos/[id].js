import React, { useEffect,  useContext, useState } from 'react';
import { useRouter } from 'next/router';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { es } from 'date-fns/locale';
import { FirebaseContext } from './../../firebase/index';
import Layout from './../../components/layout/Layouts';
import Error404 from './../../components/layout/404';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Campo, InputSubmit } from './../../components/ui/Formulario';
import Boton from '../../components/ui/Boton';

const ContenedorProducto = styled.div`
   @media (min-width:768px) {
        display: grid;
        grid-template-columns: 2fr 1fr;
        column-gap: 2rem;
   }
`;

const CreadorProducto = styled.p`
    padding: .5rem 2rem;
    background-color: #DA552F;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    display: inline-block;
    text-align: center;

`;

const Producto = () => {

    //State del component
    const [producto, guardarProducto] = useState({});
    const [error, guardarError] = useState(false);
    const [comentario, guardarComentario] = useState({});

    //Routing para obtener el ID actual
    const router = useRouter();
    const { query: { id } } = router;

    //Context de firebase
    const { firebase, usuario } = useContext(FirebaseContext);

    useEffect(() => {
        if (id) {
            const obtenerProducto = async () => {
                const productoQuery = await firebase.db.collection('productos').doc(id);
                const producto = await productoQuery.get();
                if (producto.exists) {
                    guardarProducto(producto.data());
                }
                else {
                    guardarError(true);
                }
            }
            obtenerProducto();
        }
    }, [id, producto]);

    if (Object.keys(producto).length === 0) return 'Cargando...';

    const { comentarios, creado, descripcion, empresa, nombre, url, urlimagen, votos, creador, haVotado } = producto;

    //Administrar y validar los votos

    const votarProducto = () => {
        if (!usuario) {
            return router.push('/login')
        }

        //Obtener y sumar un nuevo voto
        const nuevoTotal = votos + 1;

        //Verificar si el usuario actual ha votado
        if (haVotado.includes(usuario.uid)) return;

        //Guardar el ID del usuario que ha votado
        const nuevoHaVotado = [...haVotado, usuario.uid];

        //Actualizar en la BBDD
        firebase.db.collection('productos').doc(id).update({
            votos: nuevoTotal,
            haVotado: nuevoHaVotado
        });

        //Actualizar el state
        guardarProducto({
            ...producto,
            votos: nuevoTotal
        })
    };

    //Funciones para crear comentarios
    const comentarioChange = e => {
        guardarComentario({
            ...comentario,
            [e.target.name]: e.target.value
        })
    };

    //Identifica si el creador es el autor del comentario
    const esCreador = id => {
        if(creador.id === id){
            return true;
        }
    }

    const agregarComentario = e => {
        e.preventDefault();
        e.target.reset();
        if (!usuario) {
            return router.push('/login')
        }

        //Información extra al comentario
        comentario.usuarioId = usuario.uid;
        comentario.usuarioNombre = usuario.displayName;

        //Tomar copia de comentarios y agregarlos al arreglo
        const nuevosComentarios = [...comentarios,comentario];

        //Actualizar la BBDD
        firebase.db.collection('productos').doc(id).update({
            comentarios: nuevosComentarios
        });

        //Actualizar el state
        guardarProducto({
            ...producto,
            comentarios: nuevosComentarios
        })

        //Resetear el formulario de mensaje
        comentario.mensaje = "";
    }
    
    return (
        <Layout>
            <>
                {error && <Error404 />}
                <div className="contenedor">
                    <h1 css={css`text-align: center; margin-top: 5rem;`}>{nombre}</h1>
                    
                    <ContenedorProducto>
                        <div>
                            <p>Publicado hace: {formatDistanceToNow(new Date(creado), { locale: es })} </p>
                            <p>Autor: {creador.nombre} de {empresa}</p>
                            <img src={urlimagen} alt="Imagen Curso"/>
                            <p>{descripcion}</p>

                            {usuario && (
                                <>
                                    <h2>Agrega tu comentario</h2>
                                    <form
                                        onSubmit={agregarComentario}
                                    >
                                        <Campo>
                                            <input
                                                type="text"
                                                required
                                                name="mensaje"
                                                onChange={comentarioChange}
                                            />
                                        </Campo>
                                        <InputSubmit
                                            type="submit"
                                            value="Agregar Comentario"
                                        />
                                    </form>
                                </>
                            )}

                            <h2 css={css`margin: 2rem 0;`}>Comentarios</h2>
                            {comentarios.length === 0 ? "Aun no hay comentarios" : (
                                <ul>
                                    {comentarios.map(comentario => (
                                        <li
                                            key={`${comentario.usuarioId}`}
                                            css={css`border:1px solid #e1e1e1; padding: 2rem;`}
                                        >
                                            <p>{comentario.mensaje}</p>
                                            <p>Escrito por:
                                                <span css={css`font-weight:bold;`}>{""}{comentario.usuarioNombre}</span>
                                            </p>
                                            {esCreador(comentario.usuarioId) && <CreadorProducto>Es Creador</CreadorProducto>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        <aside>
                            
                            <Boton
                                target="_blank"
                                bgColor="true"
                                href={url}
                            >Visitar URL</Boton>

                            <div css={css`margin-top: 5rem;`}>
                                <p css={css`text-align: center;`}>{votos} Votos</p>
                                {usuario && (
                                    <Boton
                                        onClick={votarProducto}
                                    >Votar</Boton>
                                )}
                            </div>

                        </aside>
                    </ContenedorProducto>
                </div>
            </>
        </Layout>
    
    );
}
 
export default Producto;