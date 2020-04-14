const expresss = require('express');
const router = expresss.Router();
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/Project');
const Task = require('../models/Task');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({projects});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao listar projetos. Tente novamente!'});
    }
})

router.get('/:projectId', async(req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        return res.send({project});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao listar projeto. Tente novamente!'});
    }
});

router.post('/', async(req,res)=>{
    try {
        const {title, description, tasks} = req.body;

        const project = await Project.create({title, description, user: req.userId});

        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id});

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({project});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao criar novo projeto. Tente novamente!'});
    }
});

router.put('/:projectId', async(req, res) => {
    try {
        const {title, description, tasks} = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.projectId, {title, description}, {new:true});

        project.tasks = [];
        await Task.remove({project: project._id});
        
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({...task, project: project._id});

            await projectTask.save();

            project.tasks.push(projectTask);
        }));

        await project.save();

        return res.send({project});
    } catch(err) {
        return res.status(400).send({error: 'Erro ao alterar o projeto. Tente novamente!'});
    }
});

router.delete('/:projectId', async(req, res) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);

        return res.send();
    } catch(err) {
        return res.status(400).send({error: 'Erro ao deletar projeto. Tente novamente!'});
    }
});

module.exports = app => app.use('/projects', router);