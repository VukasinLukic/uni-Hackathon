# 👥 Team Coordination Guide

## Daily Standup (10 min)
- **9:00 AM** - Quick sync:
  - What did you finish yesterday?
  - What are you working on today?
  - Any blockers?

## Communication Channels
- **Backend → Mobile**: Nemanja lets Vukasin know when API endpoints are ready
- **Backend → Web**: Nemanja lets Teodora know when endpoints are ready
- **Shared API Contract**: See [API_CONTRACT.md](API_CONTRACT.md)

## Git Workflow

### Branches
```bash
main              # Production (for demo)
development       # Integration branch
feature/mobile-*  # Vukasin's features
feature/backend-* # Nemanja's features
feature/web-*     # Teodora's features
```

### Commit Convention
```
feat: add pothole detection algorithm
fix: resolve clustering bug
docs: update API documentation
style: format code
test: add sensor tests
```

## Integration Points

### Day 3: First Integration
- **Nemanja**: POST /api/events ready
- **Vukasin**: Can start sending events
- **Teodora**: Can show static data

### Day 5: Full Integration
- **All endpoints working**
- **Real-time updates active**
- **End-to-end flow tested**

## Testing Strategy

### Unit Tests
- Each developer tests their own code

### Integration Tests
- Test API endpoints together
- Test mobile → backend → web flow

### Demo Preparation (Day 7)
- Full system test
- Prepare demo script
- Have backup plan if WiFi fails

## Emergency Contacts
- **Vukasin**: Mobile issues
- **Nemanja**: Backend/API issues
- **Teodora**: Dashboard issues

## Resources
- [Backend Implementation Plan](backend/NEMANJA_IMPLEMENTATION_PLAN.md)
- [Mobile Implementation Plan](mobile/VUKASIN_IMPLEMENTATION_PLAN.md)
- [Web Implementation Plan](web/TEODORA_IMPLEMENTATION_PLAN.md)
