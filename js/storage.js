// CHRONICLE - STORAGE MANAGER
const STORAGE_KEY = 'chronicle_data';

const getDefaultData = () => ({
    circles: [],
    events: [],
    memories: [],
    members: [],
    settings: {
        version: '0.1',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    }
});

const getData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            const defaultData = getDefaultData();
            saveData(defaultData);
            return defaultData;
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Erreur lecture:', error);
        return getDefaultData();
    }
};

const saveData = (data) => {
    try {
        data.settings.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        if (error.name === 'QuotaExceededError') {
            alert('Mémoire pleine !');
        }
        return false;
    }
};

const getCircles = () => {
    const data = getData();
    return data.circles || [];
};

const addCircle = (circle) => {
    const data = getData();
    const newCircle = {
        id: `circle_${Date.now()}`,
        name: circle.name,
        icon: circle.icon,
        color: circle.color || '#D4AF37',
        createdAt: new Date().toISOString(),
        memberCount: 0
    };
    data.circles.push(newCircle);
    saveData(data);
    return newCircle;
};

const deleteCircle = (circleId) => {
    if (!confirm('Supprimer ce cercle ?')) return false;
    const data = getData();
    data.circles = data.circles.filter(c => c.id !== circleId);
    data.members = data.members.filter(m => m.circleId !== circleId);
    const circleEvents = data.events.filter(e => e.circleId === circleId);
    const eventIds = circleEvents.map(e => e.id);
    data.memories = data.memories.filter(m => !eventIds.includes(m.eventId));
    data.events = data.events.filter(e => e.circleId !== circleId);
    saveData(data);
    return true;
};

const getMembers = (circleId) => {
    const data = getData();
    return data.members.filter(m => m.circleId === circleId);
};

const addMember = (circleId, member) => {
    const data = getData();
    const newMember = {
        id: `member_${Date.now()}`,
        circleId: circleId,
        name: member.name,
        avatar: member.avatar || '👤',
        isAdmin: member.isAdmin || false,
        createdAt: new Date().toISOString()
    };
    data.members.push(newMember);
    const circle = data.circles.find(c => c.id === circleId);
    if (circle) circle.memberCount = (circle.memberCount || 0) + 1;
    saveData(data);
    return newMember;
};

const deleteMember = (memberId) => {
    const data = getData();
    const member = data.members.find(m => m.id === memberId);
    if (!member) return false;
    const memberEvents = data.events.filter(e => e.memberId === memberId);
    const eventIds = memberEvents.map(e => e.id);
    data.memories = data.memories.filter(m => !eventIds.includes(m.eventId));
    data.events = data.events.filter(e => e.memberId !== memberId);
    data.members = data.members.filter(m => m.id !== memberId);
    const circle = data.circles.find(c => c.id === member.circleId);
    if (circle && circle.memberCount > 0) circle.memberCount--;
    saveData(data);
    return true;
};

const getEvents = (memberId) => {
    const data = getData();
    return data.events.filter(e => e.memberId === memberId).sort((a, b) => a.year - b.year);
};

const addEvent = (event) => {
    const data = getData();
    const newEvent = {
        id: `event_${Date.now()}`,
        circleId: event.circleId,
        memberId: event.memberId,
        title: event.title,
        icon: event.icon,
        date: event.date,
        year: event.year,
        createdAt: new Date().toISOString()
    };
    data.events.push(newEvent);
    saveData(data);
    return newEvent;
};

const deleteEvent = (eventId) => {
    const data = getData();
    data.memories = data.memories.filter(m => m.eventId !== eventId);
    data.events = data.events.filter(e => e.id !== eventId);
    saveData(data);
    return true;
};

const getMemories = (eventId) => {
    const data = getData();
    return data.memories.filter(m => m.eventId === eventId);
};

const addMemory = (memory) => {
    const data = getData();
    const newMemory = {
        id: `memory_${Date.now()}`,
        eventId: memory.eventId,
        title: memory.title,
        description: memory.description || '',
        type: memory.type,
        mediaUrl: memory.mediaUrl,
        thumbnail: memory.thumbnail,
        linkedAudioUrl: memory.linkedAudioUrl || null,
        compressedSize: memory.compressedSize || 'N/A',
        createdAt: new Date().toISOString()
    };
    data.memories.push(newMemory);
    saveData(data);
    return newMemory;
};

const deleteMemory = (memoryId) => {
    const data = getData();
    data.memories = data.memories.filter(m => m.id !== memoryId);
    saveData(data);
    return true;
};

window.ChronicleStorage = {
    getData,
    saveData,
    getCircles,
    addCircle,
    deleteCircle,
    getMembers,
    addMember,
    deleteMember,
    getEvents,
    addEvent,
    deleteEvent,
    getMemories,
    addMemory,
    deleteMemory
};

console.log('✅ Storage Manager chargé');
